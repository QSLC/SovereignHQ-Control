# SovereignHQ Control

Private control repository for Quantum Sovereign Logistics Co. (QSLC).

## Architecture (updated Aug 20 2026)

Free-first stack — no paid builder subscriptions required:

```
iPhone (Home Screen PWA)
  |
  +-> QSLC web app / PWA (app/)
  |     |- Dashboard: revenue, sales, hours, pay
  |     |- Store: books, PDFs, templates
  |     |- Calendar: action items and deadlines
  |     |- Time Log: billing at $75/hr
  |     |- Admin: product management
  |
  +-> Cloudflare Pages ($0) — free hosting
  |     |- Unlimited static requests/bandwidth
  |     |- 500 builds/month
  |
  +-> Supabase Free ($0) — database + auth + storage
  |     |- 500 MB database
  |     |- 1 GB file storage
  |     |- 50,000 monthly active users
  |
  +-> Stripe ($0 until sale) — payment processing
  |     |- 2.9% + 30c per transaction
  |     |- Stripe Checkout redirect flow
  |
  +-> GitHub — source code + automation
```

## Repository structure

| Path | Purpose |
|------|---------|
| `app/` | QSLC PWA web app (deploy to Cloudflare Pages) |
| `app/supabase/schema.sql` | Database schema with RLS policies |
| `powershell/` | Windows launcher and automation scripts |
| `scripts/` | Shell scripts (Stripe CLI setup, etc) |
| `config/` | Configuration files |
| `docs/` | Documentation |
| `08_EVIDENCE_INDEX/` | Evidence reference index |

## Deployment

### 1. Supabase
- Create free project at supabase.com
- Run `app/supabase/schema.sql` in SQL Editor
- Copy Project URL + anon key

### 2. Stripe
- Create account at stripe.com
- Get publishable key (pk_test_... or pk_live_...)

### 3. Cloudflare Pages
- Go to pages.cloudflare.com
- Connect this GitHub repo
- Build command: (none — static site)
- Output directory: `app`
- Add environment variables:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - STRIPE_PUBLISHABLE_KEY

### 4. iPhone
- Open the Cloudflare Pages URL in Safari
- Share > Add to Home Screen
- App works as a standalone PWA

## PowerShell: Sovereign Agent Scripts

### SOVEREIGN_AGENT.ps1
Opens the full QSLC stack in browser tabs with biometric gate.

### SOVEREIGN_AUTO_AGENT.ps1
Auto-advance version — loops through 15 stack tabs with 3s delay between each.
- Biometric gate (Windows Hello) before execution
- Logs each run to 05_LOGS/
- Daily 8 PM scheduler via Install-AutoAgent-Schedule.ps1

### Install scripts
- `Install-SovereignAgentSchedule.ps1` — schedules SOVEREIGN_AGENT.ps1 daily at 8 PM
- `Install-AutoAgent-Schedule.ps1` — schedules SOVEREIGN_AUTO_AGENT.ps1 daily at 8 PM

## Authority

1. `SSOT.md`
2. GitHub `main`
3. GitHub Issues and Projects
4. Microsoft 365 source documents
5. Verified emails and attachments
6. Local mirrors

## Security

Never commit secrets, tokens, payroll exports containing protected personal data, bank documents, `.env` files, private keys, or raw identity documents. Store evidence in approved protected storage and record only evidence references in this repository.
