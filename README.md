# SovereignHQ Control

Private control repository for Quantum Sovereign Logistics Co. (QSLC).

## Authority

1. `SSOT.md`
2. GitHub `main`
3. GitHub Issues and Projects
4. Microsoft 365 source documents
5. Verified emails and attachments
6. Local mirrors

## Local mirror

Default Windows path: `C:\QSLC\QSLC-SSOT`

Run `powershell/bootstrap-qslc-ssot.ps1` from an elevated PowerShell session to create or repair the local structure, validate prerequisites, initialize Git, configure the remote, and produce an audit report.

## QSLC one-shot build agent

`powershell/QSLC-OneShot-Build-Agent.ps1` inventories local files, flags
(masked, read-only) likely secrets/card data/sensitive screenshots, and
scaffolds the QSLC production monorepo (pricing tiers, Stripe Checkout
scaffolding, a marketing-claims lint, and a release-validation gate that
never fabricates a "deployed" status). See
`docs/qslc-oneshot-build-agent.md`.

## Stripe CLI setup

See `docs/stripe-cli-setup.md` (07_STRIPE_SALES) for installing and
authenticating the Stripe CLI. Run `scripts/setup-stripe-cli.sh` to install
it. Never pass API keys or access tokens as command-line arguments.

## Security

Never commit secrets, tokens, payroll exports containing protected personal data, bank documents, `.env` files, private keys, or raw identity documents. Store evidence in approved protected storage and record only evidence references in this repository.
