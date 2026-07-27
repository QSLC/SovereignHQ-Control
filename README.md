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

## Security

Never commit secrets, tokens, payroll exports containing protected personal data, bank documents, `.env` files, private keys, or raw identity documents. Store evidence in approved protected storage and record only evidence references in this repository.
