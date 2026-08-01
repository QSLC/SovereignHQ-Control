#requires -Version 7.0
<#
QSLC One-Shot Build Agent

Single-run local agent that:
  1. Inventories files under a configurable set of local roots (SovereignHQ,
     OneDrive/SharePoint sync folders, Google Drive desktop folder, Desktop,
     Documents, and QSLC paths) and maps duplicates by content hash.
  2. Flags likely secrets (API keys, private keys), likely payment-card
     numbers, likely bank routing numbers, and sensitive screenshots by
     filename - READ-ONLY, and every report is masked. Raw secret values
     and full card/routing numbers are never written to disk.
  3. Scaffolds a QSLC production monorepo (pricing tiers, Stripe Checkout
     scaffolding, a marketing-claims lint, and a release-validation gate)
     without touching or overwriting anything under the scanned roots.
  4. Writes an evidence-style summary report and a next-actions list.

This script never fabricates deployment status. "Deployed" is only ever
set true by release-validate.ps1 once repository, commit, build, live URL,
health check, checkout test, and webhook test are all independently
verified - see docs/qslc-oneshot-build-agent.md.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string[]]$ScanRoots,
  [string]$OutputRoot = (Join-Path $HOME 'SovereignHQ/QSLC-Production'),
  [string]$EvidenceRoot = (Join-Path $HOME 'SovereignHQ/QSLC-OneShot-Evidence'),
  [switch]$SkipScan,
  [switch]$SkipMonorepo,
  [switch]$ForceContentRefresh,
  [long]$MaxHashBytes = 500MB,
  [long]$MaxTextScanBytes = 25MB
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logsDir = Join-Path $EvidenceRoot '98_AUDIT_LOGS'
$reportsDir = Join-Path $EvidenceRoot '09_REPORTS'
New-Item -ItemType Directory -Force -Path $logsDir, $reportsDir | Out-Null
$logPath = Join-Path $logsDir "oneshot-$stamp.log"

function Log([string]$Message, [string]$Level = 'INFO') {
  $line = "[$(Get-Date -Format s)] [$Level] $Message"
  Write-Host $line
  Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
}

# ---------------------------------------------------------------------------
# Phase 0: resolve scan roots
# ---------------------------------------------------------------------------
function Get-DefaultScanRoots {
  $candidates = [System.Collections.Generic.List[string]]::new()
  $candidates.Add((Join-Path $HOME 'SovereignHQ'))
  $candidates.Add((Join-Path $HOME 'Desktop'))
  $candidates.Add((Join-Path $HOME 'Documents'))
  if ($env:OneDrive) { $candidates.Add($env:OneDrive) }
  if ($env:OneDriveCommercial) { $candidates.Add($env:OneDriveCommercial) }
  if ($env:OneDriveConsumer) { $candidates.Add($env:OneDriveConsumer) }
  $candidates.Add((Join-Path $HOME 'Google Drive'))
  $candidates.Add((Join-Path $HOME 'GoogleDrive'))
  $candidates.Add('G:\My Drive')
  $candidates.Add('G:\Shared drives')
  $candidates.Add('C:\QSLC')

  $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique
}

$roots = @(if ($ScanRoots) { $ScanRoots | Where-Object { Test-Path -LiteralPath $_ } } else { Get-DefaultScanRoots })
if (-not $roots -or $roots.Count -eq 0) {
  Log 'No scan roots exist on this machine - skipping scan phases.' 'WARN'
}
else {
  Log "Scan roots: $($roots -join '; ')" 'OK'
}

# ---------------------------------------------------------------------------
# Phase 1: file inventory + duplicate map
# ---------------------------------------------------------------------------
function Get-Sha256OrSkip([System.IO.FileInfo]$File) {
  if ($File.Length -gt $MaxHashBytes) { return 'SKIPPED_LARGE_FILE' }
  try {
    return (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA256 -ErrorAction Stop).Hash
  }
  catch {
    return 'SKIPPED_UNREADABLE'
  }
}

function Build-FileInventory([string[]]$Roots) {
  $inventory = [System.Collections.Generic.List[object]]::new()
  foreach ($root in $Roots) {
    Log "Inventorying $root" 'INFO'
    try {
      Get-ChildItem -LiteralPath $root -Recurse -File -Force -ErrorAction SilentlyContinue |
        ForEach-Object {
          $inventory.Add([pscustomobject]@{
            Root          = $root
            FullName      = $_.FullName
            Name          = $_.Name
            Extension     = $_.Extension.ToLowerInvariant()
            SizeBytes     = $_.Length
            LastWriteUtc  = $_.LastWriteTimeUtc.ToString('o')
            Sha256        = Get-Sha256OrSkip $_
          })
        }
    }
    catch {
      Log "Could not fully enumerate $root - $($_.Exception.Message)" 'WARN'
    }
  }
  return $inventory
}

function Build-DuplicateMap($Inventory) {
  $Inventory |
    Where-Object { $_.Sha256 -notin @('SKIPPED_LARGE_FILE', 'SKIPPED_UNREADABLE', '') } |
    Group-Object Sha256 |
    Where-Object { $_.Count -gt 1 } |
    ForEach-Object {
      [pscustomobject]@{
        Sha256      = $_.Name
        Count       = $_.Count
        TotalBytes  = ($_.Group | Measure-Object -Property SizeBytes -Sum).Sum
        Paths       = ($_.Group.FullName -join ' | ')
      }
    }
}

# ---------------------------------------------------------------------------
# Phase 2: secret / sensitive-data scan (read-only, masked output only)
# ---------------------------------------------------------------------------
$secretPatterns = @(
  [pscustomobject]@{ Name = 'StripeLiveSecretKey';  Category = 'ApiKey';  Regex = 'sk_live_[0-9a-zA-Z]{10,}' }
  [pscustomobject]@{ Name = 'StripeTestSecretKey';  Category = 'ApiKey';  Regex = 'sk_test_[0-9a-zA-Z]{10,}' }
  [pscustomobject]@{ Name = 'StripeRestrictedKey';  Category = 'ApiKey';  Regex = 'rk_(live|test)_[0-9a-zA-Z]{10,}' }
  [pscustomobject]@{ Name = 'StripePublishableKey'; Category = 'ApiKey';  Regex = 'pk_(live|test)_[0-9a-zA-Z]{10,}' }
  [pscustomobject]@{ Name = 'AWSAccessKeyId';       Category = 'ApiKey';  Regex = 'AKIA[0-9A-Z]{16}' }
  [pscustomobject]@{ Name = 'GitHubToken';          Category = 'ApiKey';  Regex = '(ghp|gho|ghu|ghs|ghr|github_pat)_[0-9A-Za-z_]{20,}' }
  [pscustomobject]@{ Name = 'SlackToken';           Category = 'ApiKey';  Regex = 'xox[baprs]-[0-9A-Za-z-]{10,}' }
  [pscustomobject]@{ Name = 'JsonWebToken';         Category = 'ApiKey';  Regex = 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' }
  [pscustomobject]@{ Name = 'GenericApiKeyAssign';  Category = 'ApiKey';  Regex = '(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)["'']?\s*[:=]\s*["''][A-Za-z0-9\-_/+=]{16,}["'']' }
  [pscustomobject]@{ Name = 'PrivateKeyHeader';     Category = 'PrivateKey'; Regex = '-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----' }
  [pscustomobject]@{ Name = 'BankRoutingNumber';    Category = 'Financial'; Regex = '(?i)routing[^0-9]{0,20}\b\d{9}\b' }
  [pscustomobject]@{ Name = 'CardNumberCandidate';  Category = 'Financial'; Regex = '(?<!\d)(?:\d[ -]?){13,19}(?!\d)' }
)

$contentExtensions = '.txt', '.md', '.csv', '.json', '.log', '.yml', '.yaml', '.env', '.ini', '.conf',
  '.config', '.ps1', '.psm1', '.sh', '.js', '.ts', '.jsx', '.tsx', '.py', '.xml', '.htm', '.html'

function Test-LuhnValid([string]$Digits) {
  $sum = 0
  $alt = $false
  for ($i = $Digits.Length - 1; $i -ge 0; $i--) {
    $n = [int]::Parse($Digits[$i])
    if ($alt) { $n *= 2; if ($n -gt 9) { $n -= 9 } }
    $sum += $n
    $alt = -not $alt
  }
  return ($sum % 10) -eq 0
}

function Get-MaskedSnippet([string]$Value) {
  $clean = $Value.Trim()
  if ($clean.Length -le 6) { return ('*' * $clean.Length) }
  $head = $clean.Substring(0, 2)
  $tail = $clean.Substring($clean.Length - 2, 2)
  return "$head$('*' * ($clean.Length - 4))$tail"
}

function Find-SecretFindings($Inventory) {
  $findings = [System.Collections.Generic.List[object]]::new()
  $candidates = $Inventory | Where-Object { $contentExtensions -contains $_.Extension -and $_.SizeBytes -le $MaxTextScanBytes }
  foreach ($file in $candidates) {
    try {
      $lineMatches = Select-String -LiteralPath $file.FullName -Pattern $secretPatterns.Regex -ErrorAction Stop
    }
    catch { continue }
    foreach ($lineMatch in $lineMatches) {
      foreach ($pattern in $secretPatterns) {
        foreach ($m in [regex]::Matches($lineMatch.Line, $pattern.Regex)) {
          if ($pattern.Name -eq 'CardNumberCandidate') {
            $digitsOnly = ($m.Value -replace '[^0-9]', '')
            if ($digitsOnly.Length -lt 13 -or $digitsOnly.Length -gt 19 -or -not (Test-LuhnValid $digitsOnly)) { continue }
          }
          $findings.Add([pscustomobject]@{
            FilePath      = $file.FullName
            Category      = $pattern.Category
            PatternName   = $pattern.Name
            LineNumber    = $lineMatch.LineNumber
            MaskedSnippet = Get-MaskedSnippet $m.Value
          })
        }
      }
    }
  }
  return $findings
}

$imageExtensions = '.png', '.jpg', '.jpeg', '.heic', '.webp', '.gif', '.bmp', '.tif', '.tiff'
$keyExtensions = '.pem', '.key', '.pfx', '.p12', '.ppk'
$keyFilenames = 'id_rsa', 'id_dsa', 'id_ecdsa', 'id_ed25519'
$sensitiveKeywords = 'card', 'cvv', 'ssn', 'social security', 'routing', 'account number', 'bank',
  'statement', 'passport', 'license', 'seed phrase', 'seed', 'private key', 'wallet', 'password', 'pin'

function Find-SensitiveFileCandidates($Inventory) {
  # Filename-only heuristics. Image content is not OCR'd; extension-less
  # or non-text private-key files are not content-scanned by Find-SecretFindings,
  # so they are caught here by filename instead.
  $findings = [System.Collections.Generic.List[object]]::new()
  foreach ($file in $Inventory) {
    $nameLower = $file.Name.ToLowerInvariant()
    $isImage = $imageExtensions -contains $file.Extension
    $isKeyFile = ($keyExtensions -contains $file.Extension) -or ($keyFilenames -contains $file.Name)
    if (-not $isImage -and -not $isKeyFile) { continue }

    if ($isKeyFile) {
      $findings.Add([pscustomobject]@{
        FilePath        = $file.FullName
        Confidence      = 'HIGH'
        MatchedKeywords = 'private-key-filename'
      })
      continue
    }

    $hits = $sensitiveKeywords | Where-Object { $nameLower.Contains($_) }
    if ($hits) {
      $findings.Add([pscustomobject]@{
        FilePath        = $file.FullName
        Confidence      = 'HIGH'
        MatchedKeywords = ($hits -join ', ')
      })
    }
    elseif ($nameLower -match 'screenshot|screen shot|img_\d|scr_\d') {
      $findings.Add([pscustomobject]@{
        FilePath        = $file.FullName
        Confidence      = 'REVIEW'
        MatchedKeywords = ''
      })
    }
  }
  return $findings
}

# ---------------------------------------------------------------------------
# Phase 3: QSLC production monorepo scaffold (never overwrites by default)
# ---------------------------------------------------------------------------
function New-ManagedFile([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if ((Test-Path -LiteralPath $Path) -and -not $ForceContentRefresh) {
    Log "Preserved existing $Path" 'WARN'
    return
  }
  if (-not $PSCmdlet.ShouldProcess($Path, 'Write file')) { return }
  Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
  Log "Wrote $Path" 'OK'
}

$pricingTiersJson = @'
{
  "currency": "USD",
  "tiers": [
    { "id": "starter",      "name": "Starter",      "monthlyPriceUsd": 49,   "stripePriceIdEnvVar": "STRIPE_PRICE_STARTER" },
    { "id": "professional", "name": "Professional", "monthlyPriceUsd": 199,  "stripePriceIdEnvVar": "STRIPE_PRICE_PROFESSIONAL" },
    { "id": "pathfinder",   "name": "Pathfinder",   "monthlyPriceUsd": 499,  "stripePriceIdEnvVar": "STRIPE_PRICE_PATHFINDER" },
    { "id": "sovereign",    "name": "Sovereign",    "monthlyPriceUsd": 2499, "stripePriceIdEnvVar": "STRIPE_PRICE_SOVEREIGN" },
    { "id": "enterprise",   "name": "Enterprise",   "monthlyPriceUsd": null, "pricingModel": "contract", "stripePriceIdEnvVar": "STRIPE_PRICE_ENTERPRISE" }
  ]
}
'@

$checkoutServerStub = @'
// Stripe Checkout scaffolding - server side.
// Reads price IDs and the secret key from environment variables only.
// Never hardcode a key here; see docs/stripe-cli-setup.md.
// TODO: wire this handler into the real HTTP framework used by apps/api.
const Stripe = require("stripe");

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

async function createCheckoutSession(tierId, priceEnvVar, successUrl, cancelUrl) {
  const priceId = process.env[priceEnvVar];
  if (!priceId) throw new Error(`${priceEnvVar} is not set for tier ${tierId}`);
  const stripe = getStripeClient();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

module.exports = { createCheckoutSession };
'@

$checkoutClientStub = @'
// Stripe Checkout scaffolding - client side.
// TODO: replace with the real pricing-page integration for apps/web.
export async function startCheckout(tierId) {
  const res = await fetch("/api/checkout/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tierId }),
  });
  if (!res.ok) throw new Error(`Checkout session request failed: ${res.status}`);
  const { url } = await res.json();
  window.location.assign(url);
}
'@

$claimsPolicyJson = @'
{
  "bannedPhrases": [
    "live",
    "100% uptime",
    "patent pending",
    "patent-pending"
  ],
  "bannedPatterns": [
    "\\d+(\\.\\d+)?\\s*%\\s*uptime",
    "token value of \\$?\\d+",
    "\\$[\\d,]+(\\.\\d+)?\\s*(in\\s+)?(revenue|sales|funding|valuation)"
  ],
  "notes": "A line matching a banned phrase/pattern is allowed only if the same line also contains an EvidenceID: reference resolvable in 08_EVIDENCE_INDEX/EVIDENCE_INDEX.csv. See SSOT.md evidence rule."
}
'@

$claimsLintScript = @'
#requires -Version 7.0
# Fails (non-zero exit) if any scanned file contains a banned claim/pattern
# from ../compliance/claims-policy.json without an adjacent EvidenceID:
# reference. Intended to run in CI before any release is marked deployed.
[CmdletBinding()]
param(
  [string[]]$Paths = @('../apps', '../docs'),
  [string]$PolicyPath = (Join-Path $PSScriptRoot '../compliance/claims-policy.json')
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$policy = Get-Content -LiteralPath $PolicyPath -Raw | ConvertFrom-Json
$patterns = @()
$patterns += $policy.bannedPhrases | ForEach-Object { [regex]::Escape($_) }
$patterns += $policy.bannedPatterns
$violations = @()
foreach ($root in $Paths) {
  if (-not (Test-Path -LiteralPath $root)) { continue }
  Get-ChildItem -LiteralPath $root -Recurse -File -Include *.md, *.html, *.htm, *.js, *.jsx, *.ts, *.tsx, *.json |
    ForEach-Object {
      Select-String -LiteralPath $_.FullName -Pattern $patterns -AllMatches |
        Where-Object { $_.Line -notmatch 'EvidenceID:' } |
        ForEach-Object { $violations += $_ }
    }
}
if ($violations.Count -gt 0) {
  $violations | ForEach-Object { Write-Error "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
  Write-Host "$($violations.Count) unsupported claim(s) found - blocking release." -ForegroundColor Red
  exit 1
}
Write-Host 'No unsupported claims found.' -ForegroundColor Green
exit 0
'@

$deploymentStatusTemplate = @'
{
  "deployed": false,
  "repository": null,
  "commitSha": null,
  "buildStatus": "PENDING",
  "liveUrl": null,
  "healthCheck": { "status": "PENDING", "checkedAtUtc": null, "httpStatusCode": null },
  "checkoutTest": { "status": "PENDING", "checkedAtUtc": null, "notes": null },
  "webhookTest": { "status": "PENDING", "checkedAtUtc": null, "notes": null },
  "blockedReasons": [
    "repository not set",
    "commitSha not set",
    "buildStatus not success",
    "liveUrl not set",
    "healthCheck not verified",
    "checkoutTest not verified",
    "webhookTest not verified"
  ]
}
'@

$releaseValidateScript = @'
#requires -Version 7.0
<#
Validates release/deployment-status.json against the required evidence
fields before anything may be labeled "deployed". Never fabricates a
passing result: healthCheck is only marked PASS if -LiveUrl is supplied
and an actual HTTP request succeeds. checkoutTest/webhookTest must be
supplied as already-verified evidence (this script does not simulate a
Stripe checkout or webhook delivery).
#>
[CmdletBinding()]
param(
  [string]$StatusPath = (Join-Path $PSScriptRoot 'deployment-status.json'),
  [string]$Repository,
  [string]$CommitSha,
  [ValidateSet('PENDING', 'SUCCESS', 'FAILURE')]
  [string]$BuildStatus,
  [string]$LiveUrl,
  [switch]$RunHealthCheck,
  [ValidateSet('PENDING', 'PASS', 'FAIL')]
  [string]$CheckoutTestStatus,
  [ValidateSet('PENDING', 'PASS', 'FAIL')]
  [string]$WebhookTestStatus
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$status = Get-Content -LiteralPath $StatusPath -Raw | ConvertFrom-Json
if ($Repository) { $status.repository = $Repository }
if ($CommitSha) { $status.commitSha = $CommitSha }
if ($BuildStatus) { $status.buildStatus = $BuildStatus }
if ($LiveUrl) { $status.liveUrl = $LiveUrl }
if ($CheckoutTestStatus) { $status.checkoutTest.status = $CheckoutTestStatus; $status.checkoutTest.checkedAtUtc = (Get-Date).ToUniversalTime().ToString('o') }
if ($WebhookTestStatus) { $status.webhookTest.status = $WebhookTestStatus; $status.webhookTest.checkedAtUtc = (Get-Date).ToUniversalTime().ToString('o') }

if ($RunHealthCheck -and $status.liveUrl) {
  try {
    $resp = Invoke-WebRequest -Uri $status.liveUrl -Method Get -TimeoutSec 15 -ErrorAction Stop
    $status.healthCheck.httpStatusCode = [int]$resp.StatusCode
    $status.healthCheck.status = if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) { 'PASS' } else { 'FAIL' }
  }
  catch {
    $status.healthCheck.status = 'FAIL'
    $status.healthCheck.httpStatusCode = $null
  }
  $status.healthCheck.checkedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
}

$blocked = [System.Collections.Generic.List[string]]::new()
if (-not $status.repository) { $blocked.Add('repository not set') }
if (-not $status.commitSha) { $blocked.Add('commitSha not set') }
if ($status.buildStatus -ne 'SUCCESS') { $blocked.Add('buildStatus not SUCCESS') }
if (-not $status.liveUrl) { $blocked.Add('liveUrl not set') }
if ($status.healthCheck.status -ne 'PASS') { $blocked.Add('healthCheck not PASS') }
if ($status.checkoutTest.status -ne 'PASS') { $blocked.Add('checkoutTest not PASS') }
if ($status.webhookTest.status -ne 'PASS') { $blocked.Add('webhookTest not PASS') }

$status.blockedReasons = $blocked
$status.deployed = ($blocked.Count -eq 0)

$status | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $StatusPath -Encoding UTF8
if ($status.deployed) {
  Write-Host 'Release validated - deployed=true' -ForegroundColor Green
}
else {
  Write-Host "Release NOT deployable yet - $($blocked -join '; ')" -ForegroundColor Yellow
}
$status
'@

function New-QslcMonorepo([string]$Root) {
  Log "Building QSLC production monorepo at $Root" 'INFO'
  New-ManagedFile (Join-Path $Root 'packages/pricing/pricing-tiers.json') $pricingTiersJson
  New-ManagedFile (Join-Path $Root 'packages/stripe-checkout/checkout.server.stub.js') $checkoutServerStub
  New-ManagedFile (Join-Path $Root 'packages/stripe-checkout/checkout.client.stub.js') $checkoutClientStub
  New-ManagedFile (Join-Path $Root 'compliance/claims-policy.json') $claimsPolicyJson
  New-ManagedFile (Join-Path $Root 'compliance/claims-lint.ps1') $claimsLintScript
  New-ManagedFile (Join-Path $Root 'release/deployment-status.json') $deploymentStatusTemplate
  New-ManagedFile (Join-Path $Root 'release/release-validate.ps1') $releaseValidateScript
  New-ManagedFile (Join-Path $Root 'apps/web/.gitkeep') ''
  New-ManagedFile (Join-Path $Root 'apps/api/.gitkeep') ''
  New-ManagedFile (Join-Path $Root 'README.md') @"
# QSLC Production Monorepo

Scaffolded by powershell/QSLC-OneShot-Build-Agent.ps1 on $stamp.

- ``packages/pricing`` - pricing tier definitions (Starter/Professional/Pathfinder/Sovereign/Enterprise).
- ``packages/stripe-checkout`` - Stripe Checkout scaffolding. Requires real Stripe credentials via environment variables; none are included here.
- ``compliance`` - marketing-claims lint. Blocks unsupported claims (e.g. "live", "100% uptime", "patent pending", bare token/revenue figures) unless backed by an EvidenceID.
- ``release`` - release-validate.ps1 and deployment-status.json. A release cannot be marked ``deployed: true`` until repository, commit, build, live URL, health check, checkout test, and webhook test are all independently verified.

Publishing still requires real GitHub, Stripe, Base44, Cloudflare/Vercel, Google, and Microsoft credentials supplied on the machine that runs this. This scaffold never fakes completion when those credentials are missing.
"@
}

# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------
$summary = [ordered]@{
  timestampUtc         = (Get-Date).ToUniversalTime().ToString('o')
  scanRoots            = @($roots)
  inventoryCount       = 0
  inventoryTotalBytes  = 0
  duplicateGroupCount  = 0
  duplicateWastedBytes = 0
  secretFindingsByCat  = @{}
  sensitiveFileCandidates = 0
  monorepoRoot         = $OutputRoot
  monorepoBuilt        = $false
}

try {
  if (-not $SkipScan -and $roots -and $roots.Count -gt 0) {
    $inventory = Build-FileInventory $roots
    $summary.inventoryCount = $inventory.Count
    $summary.inventoryTotalBytes = ($inventory | Measure-Object -Property SizeBytes -Sum).Sum
    $inventory | Export-Csv -LiteralPath (Join-Path $reportsDir "file-inventory-$stamp.csv") -NoTypeInformation -Encoding UTF8
    Log "Inventory: $($summary.inventoryCount) files, $($summary.inventoryTotalBytes) bytes" 'OK'

    $dupes = Build-DuplicateMap $inventory
    $summary.duplicateGroupCount = @($dupes).Count
    $summary.duplicateWastedBytes = (($dupes | ForEach-Object { $_.TotalBytes - ($_.TotalBytes / $_.Count) }) | Measure-Object -Sum).Sum
    $dupes | Export-Csv -LiteralPath (Join-Path $reportsDir "duplicate-map-$stamp.csv") -NoTypeInformation -Encoding UTF8
    Log "Duplicate groups: $($summary.duplicateGroupCount)" 'OK'

    $secretFindings = Find-SecretFindings $inventory
    $secretFindings | Export-Csv -LiteralPath (Join-Path $reportsDir "secret-findings-$stamp.csv") -NoTypeInformation -Encoding UTF8
    $summary.secretFindingsByCat = @{}
    foreach ($g in ($secretFindings | Group-Object Category)) { $summary.secretFindingsByCat[$g.Name] = $g.Count }
    Log "Secret/sensitive-data findings: $($secretFindings.Count) (masked, see secret-findings-$stamp.csv)" 'OK'

    $screenshotFindings = Find-SensitiveFileCandidates $inventory
    $screenshotFindings | Export-Csv -LiteralPath (Join-Path $reportsDir "sensitive-files-$stamp.csv") -NoTypeInformation -Encoding UTF8
    $summary.sensitiveFileCandidates = @($screenshotFindings | Where-Object Confidence -eq 'HIGH').Count
    Log "Sensitive file candidates (screenshots/keys): $($screenshotFindings.Count)" 'OK'
  }
  else {
    Log 'Scan phase skipped.' 'WARN'
  }

  if (-not $SkipMonorepo) {
    New-QslcMonorepo $OutputRoot
    $summary.monorepoBuilt = $true
  }
  else {
    Log 'Monorepo build phase skipped.' 'WARN'
  }

  $reportMd = @"
# QSLC One-Shot Build Agent Report - $stamp

## Scan
- Roots scanned: $($summary.scanRoots -join '; ')
- Files inventoried: $($summary.inventoryCount)
- Total bytes: $($summary.inventoryTotalBytes)
- Duplicate groups: $($summary.duplicateGroupCount) (~$($summary.duplicateWastedBytes) reclaimable bytes)
- Secret/sensitive-data findings (masked): $(($summary.secretFindingsByCat.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ')
- High-confidence sensitive files (screenshots/keys): $($summary.sensitiveFileCandidates)

## Monorepo
- Root: $($summary.monorepoRoot)
- Built this run: $($summary.monorepoBuilt)

## Next actions
1. Review secret-findings-$stamp.csv and sensitive-files-$stamp.csv; rotate/remove anything real, and confirm the Bluevine card mentioned in this run's source conversation has already been replaced.
2. Move any confirmed secrets out of scanned paths into approved protected storage; never commit them.
3. Supply real Stripe price IDs and STRIPE_SECRET_KEY as environment variables before using packages/stripe-checkout.
4. Run compliance/claims-lint.ps1 against any marketing copy before publishing.
5. Run release/release-validate.ps1 with real -Repository, -CommitSha, -BuildStatus, -LiveUrl, -RunHealthCheck, -CheckoutTestStatus, and -WebhookTestStatus once each is independently verified; it will not report deployed=true otherwise.
"@
  Set-Content -LiteralPath (Join-Path $reportsDir "ONESHOT-REPORT-$stamp.md") -Value $reportMd -Encoding UTF8
  ($summary | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath (Join-Path $reportsDir "oneshot-summary-$stamp.json") -Encoding UTF8

  Log "QSLC one-shot build complete. Reports in $reportsDir" 'OK'
}
catch {
  Log "QSLC one-shot build failed: $($_.Exception.Message)" 'ERROR'
  throw
}
