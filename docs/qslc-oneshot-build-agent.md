# QSLC One-Shot Build Agent

`powershell/QSLC-OneShot-Build-Agent.ps1` is a single-run local agent for a
Windows machine (e.g. the ROG) with PowerShell 7. It does not touch this
repository or any remote system — everything it reads and writes is local.

## Run it

```powershell
Set-ExecutionPolicy -Scope Process Bypass
pwsh -File .\QSLC-OneShot-Build-Agent.ps1
```

By default it scans whichever of these exist on the machine: `~\SovereignHQ`,
`~\Desktop`, `~\Documents`, the OneDrive/SharePoint sync folders (via the
`OneDrive`/`OneDriveCommercial`/`OneDriveConsumer` environment variables),
common Google Drive desktop mount points, and `C:\QSLC`. Pass `-ScanRoots`
to override. It writes the production scaffold to
`C:\Users\<you>\SovereignHQ\QSLC-Production` (`-OutputRoot` to override) and
evidence/reports to `C:\Users\<you>\SovereignHQ\QSLC-OneShot-Evidence`
(`-EvidenceRoot` to override).

## What it does

### 1. Inventory and duplicate map (read-only)

Walks the scan roots, records path/size/timestamp/SHA-256 for every file
(large files above `-MaxHashBytes`, default 500MB, are listed but not
hashed), and writes:

- `file-inventory-<timestamp>.csv`
- `duplicate-map-<timestamp>.csv` — files that share a hash, grouped, with
  the reclaimable byte count.

Nothing under a scan root is ever modified, moved, or deleted.

### 2. Secret and sensitive-data scan (read-only, masked output)

Scans text-like files (`.txt .md .csv .json .log .yml .yaml .env .ini
.conf .config .ps1 .sh .js .ts .py .xml .html` and similar, capped at
`-MaxTextScanBytes`, default 25MB) for:

- API keys and tokens: Stripe (`sk_live_`/`sk_test_`/`rk_`/`pk_`), AWS
  access key IDs, GitHub tokens, Slack tokens, JWTs, and generic
  `api_key=`/`secret_key=`/`access_token=` assignments.
- Private key headers (`-----BEGIN ... PRIVATE KEY-----`).
- Likely bank routing numbers (9 digits near the word "routing").
- Likely payment-card numbers (13–19 digit sequences that pass a Luhn
  check, to cut down on false positives from phone numbers/IDs).

Separately, by filename only (no OCR, no image content is read): flags
image files whose name contains a sensitive keyword (`card`, `ssn`,
`bank`, `statement`, `passport`, `seed`, `wallet`, `password`, …) as
`HIGH` confidence, any other file that looks like a screenshot as
`REVIEW`, and private-key-shaped files (`id_rsa`, `id_ed25519`, `*.pem`,
`*.key`, `*.pfx`, `*.p12`, `*.ppk`) as `HIGH`.

Output:

- `secret-findings-<timestamp>.csv` — file, category, pattern name, line
  number, and a **masked** snippet only (first/last 2 characters, the
  rest replaced with `*`). The raw secret value is never written to any
  report.
- `sensitive-files-<timestamp>.csv` — file, confidence, matched keyword(s).

Per `SSOT.md`'s security rule, treat every finding as something to rotate
or move into approved protected storage — this report is a pointer, not a
place to keep the secret.

### 3. QSLC production monorepo scaffold

Writes (without overwriting anything that already exists, unless you pass
`-ForceContentRefresh`, which backs up before overwriting is out of scope
here — see the equivalent pattern in `bootstrap-qslc-ssot.ps1`):

- `packages/pricing/pricing-tiers.json` — Starter ($49/mo), Professional
  ($199/mo), Pathfinder ($499/mo), Sovereign ($2,499/mo), Enterprise
  (contract).
- `packages/stripe-checkout/` — Checkout session scaffolding. Reads the
  Stripe secret key and price IDs from environment variables
  (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, …); no credential is ever
  written into the scaffold. See `docs/stripe-cli-setup.md` for how to
  supply the real key.
- `compliance/claims-policy.json` + `compliance/claims-lint.ps1` — blocks
  unsupported claims: "live", "100% uptime", "patent pending", bare
  uptime/token-value/revenue figures, unless the same line carries an
  `EvidenceID:` reference resolvable in `08_EVIDENCE_INDEX/EVIDENCE_INDEX.csv`.
  Run it against marketing copy before publishing; non-zero exit blocks
  the release.
- `release/deployment-status.json` + `release/release-validate.ps1` — the
  release gate. A release is only `"deployed": true` once repository,
  commit SHA, a `SUCCESS` build status, a live URL, a real health check
  (`-RunHealthCheck` makes an actual HTTP request — it never fabricates a
  `PASS`), a checkout test, and a webhook test are all supplied as
  verified evidence. Anything missing lands in `blockedReasons`.

### 4. Reports

- `ONESHOT-REPORT-<timestamp>.md` — human-readable summary and a
  next-actions list.
- `oneshot-summary-<timestamp>.json` — the same data, machine-readable.
- `oneshot-<timestamp>.log` under `98_AUDIT_LOGS` — full run log.

## What it does not do

It does not publish anything. Actually deploying still requires the real
GitHub, Stripe, Base44, Cloudflare/Vercel, Google, and Microsoft credentials
on the machine that runs it, supplied through each service's own
authentication flow (never as a literal argument or committed file). If
those credentials are missing, the relevant step in `release-validate.ps1`
stays `PENDING`/blocked — it will not report success it hasn't verified.
