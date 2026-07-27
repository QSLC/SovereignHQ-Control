#requires -Version 7.0
[CmdletBinding(SupportsShouldProcess=$true)]
param(
  [string]$Root='C:\QSLC',
  [string]$RepoUrl='https://github.com/Sovereign-maxeffort/SovereignHQ-Control.git',
  [switch]$SkipPush,
  [switch]$ForceContentRefresh
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$repo=Join-Path $Root 'QSLC-SSOT'
$logs=Join-Path $Root '98_AUDIT_LOGS'
$backup=Join-Path $Root "97_BACKUPS\$stamp"
New-Item -ItemType Directory -Force -Path $logs,$backup | Out-Null
$log=Join-Path $logs "bootstrap-$stamp.log"
function Log([string]$m,[string]$level='INFO'){
  $line="[$(Get-Date -Format s)] [$level] $m"
  Write-Host $line
  Add-Content -LiteralPath $log -Value $line -Encoding UTF8
}
function Dir([string]$p){if(!(Test-Path -LiteralPath $p)){New-Item -ItemType Directory -Force -Path $p|Out-Null;Log "Created $p" 'OK'}}
function Managed([string]$p,[string]$c){
  Dir (Split-Path -Parent $p)
  if((Test-Path -LiteralPath $p)-and !$ForceContentRefresh){Log "Preserved $p" 'WARN';return}
  if(Test-Path -LiteralPath $p){$r=$p.Substring($Root.Length).TrimStart('\');$b=Join-Path $backup $r;Dir (Split-Path -Parent $b);Copy-Item $p $b -Force}
  Set-Content -LiteralPath $p -Value $c -Encoding UTF8
  Log "Wrote $p" 'OK'
}
foreach($d in @(
'00_START_HERE','01_BANKING_INCIDENTS','02_PAYROLL_PAYCHEX','03_APPS_PRODUCTS','04_SHAREPOINT_ONEDRIVE','05_FUNDING_LOANS','06_LEGAL_COMPLIANCE','07_STRIPE_SALES','08_EVIDENCE_INDEX','09_REPORTS','10_AUTOMATIONS','97_BACKUPS','98_AUDIT_LOGS','99_ARCHIVE_ORIGINALS','QSLC-SSOT','QSLC-SSOT\docs','QSLC-SSOT\automation','QSLC-SSOT\powershell','QSLC-SSOT\agents\eve','QSLC-SSOT\agents\claude','QSLC-SSOT\integrations\m365','QSLC-SSOT\integrations\paychex','QSLC-SSOT\integrations\mercury','QSLC-SSOT\dashboards','QSLC-SSOT\.github\workflows')){Dir (Join-Path $Root $d)}
$ssot=@'
# QSLC Single Source of Truth
Owner: Antwan White
Company: Quantum Sovereign Logistics Co.
Authority: Sovereign-maxeffort/SovereignHQ-Control
Local mirror: C:\QSLC\QSLC-SSOT

## Truth hierarchy
1. SSOT.md
2. GitHub main
3. GitHub Issues and Projects
4. Verified Microsoft 365 documents
5. Verified emails and attachments
6. Local evidence mirror
7. Chats and unverified notes

## Security
Never commit secrets, tokens, private keys, complete bank/payroll records, identity documents, or protected employee data. Store protected evidence in restricted storage and commit references/hashes only.
'@
$readme="# QSLC-SSOT Local Mirror`n`nAuthority: $RepoUrl`n"
$ignore=@'
.env
.env.*
*.key
*.pem
*.pfx
*.p12
*.token
secrets/
credentials/
node_modules/
dist/
coverage/
*.log
*.db
*.sqlite*
.vscode/
.idea/
**/*bank*.pdf
**/*payroll*.pdf
**/*identity*.pdf
'@
$queue=@'
Priority,Category,Action,Status,Owner,EvidenceRequired,DueDate,LastUpdated
1,BANKING,Confirm approved business banking destination,OPEN,Antwan White,YES,,2026-07-27
2,PAYROLL,Confirm Paychex bank letter status and payment method,OPEN,Antwan White,YES,,2026-07-27
3,PAYROLL,Update verified routing only after account approval,BLOCKED,Antwan White,YES,,2026-07-27
4,LEGAL,Confirm Washington Secretary of State legal name and standing,OPEN,Antwan White,YES,,2026-07-27
5,STRIPE,Complete verified pre-publish checklist,OPEN,Antwan White,YES,,2026-07-27
6,SSOT,Synchronize SovereignHQ-Control,IN_PROGRESS,EVE,YES,,2026-07-27
7,EVIDENCE,Build protected evidence index,OPEN,EVE,YES,,2026-07-27
'@
$evidence='EvidenceID,Category,Claim,SourceSystem,SourceLocation,CapturedDate,VerifiedBy,VerificationStatus,SHA256,Notes'
Managed (Join-Path $repo 'SSOT.md') $ssot
Managed (Join-Path $repo 'README.md') $readme
Managed (Join-Path $repo '.gitignore') $ignore
Managed (Join-Path $Root '00_START_HERE\ACTION_QUEUE.csv') $queue
Managed (Join-Path $Root '08_EVIDENCE_INDEX\EVIDENCE_INDEX.csv') $evidence
foreach($cmd in 'git','pwsh'){if(!(Get-Command $cmd -ErrorAction SilentlyContinue)){throw "$cmd is required"};Log "Verified $cmd" 'OK'}
Push-Location $repo
try{
  if(!(Test-Path '.git')){git init -b main|Out-Null;Log 'Initialized Git' 'OK'}
  $origin=git remote get-url origin 2>$null
  if($LASTEXITCODE-ne 0){git remote add origin $RepoUrl}else{git remote set-url origin $RepoUrl}
  git add .
  if(git status --porcelain){git commit -m "Bootstrap QSLC SSOT $stamp"|Out-Null;Log 'Committed local changes' 'OK'}
  if(!$SkipPush){git pull --rebase origin main; if($LASTEXITCODE-ne 0){throw 'git pull failed'};git push -u origin main;if($LASTEXITCODE-ne 0){throw 'git push failed'};Log 'Synchronized origin/main' 'OK'}
  [ordered]@{timestamp=(Get-Date).ToString('o');root=$Root;repo=$repo;remote=$RepoUrl;head=(git rev-parse HEAD);status=(git status --porcelain);result='SUCCESS'}|ConvertTo-Json|Set-Content (Join-Path $logs "report-$stamp.json") -Encoding UTF8
  Log 'QSLC SSOT bootstrap complete' 'OK'
}finally{Pop-Location}
