# QSLC Company Handbook

**Version:** 2026.09.29-r2  
**Company:** Quantum Sovereign Logistics Corp (QSLC)  
**Control principle:** One entry → one evidence chain → existing authority → one Control Tower.

## 1. Mission & Vision
Operate QSLC through a governed, evidence-first control plane that preserves source evidence, maintains authoritative domain records, and exposes verified operational status through EVE and the QSLC Control Tower.

## 2. Organizational Structure
QSLC uses role-based authority. Executive, employee, agent, auditor, treasury, payroll, and system roles receive only the access required for their function. Administrative actions must be attributable and auditable.

## 3. Governance & SSOT Policy
- `NO_EVIDENCE_NO_APPROVAL`
- `NO_LINEAGE_NO_DELETION`
- `NO_PROVIDER_PROOF_NO_SETTLEMENT`
- Estimates never silently become verified facts.
- Provider evidence outranks dashboard labels and generated metrics.
- Secrets, passwords, recovery keys, full account numbers, SSNs, and unrestricted API keys do not belong in workbooks or public dashboards.
- Domain SSOTs remain authoritative for their governed subject. This handbook does not create a competing master workbook.

## 4. Intake Policy
The authoritative intake front door is SharePoint `00_INTAKE`.

`iPhone / Email / Screenshot / PDF / File → 00_INTAKE → EVE Governor → Evidence → Domain SSOT → Control Tower`

iCloud `Agent/Inbox` may be used as device-side staging only. It is not an authoritative record store.

## 5. Evidence Vault Policy
Preserve originals before transformation. Record source/provider, timestamps, identity hash where supported, owner, classification, evidence state, lineage, and duplicate status.

## 6. Payroll & Hours Governance
`UNVERIFIED → CALCULATED/RECONSTRUCTED → VERIFIED/APPROVED → PAYROLL READY → PROVIDER PROCESSED → SETTLED`.
System activity can support time verification but does not automatically create payroll hours. Conflicts remain flagged until reconciled.

### Verified QSLC payroll cadence
- Pay frequency: weekly.
- Historical pay period: Sunday through Saturday.
- Historical check-date pattern: Monday following the Saturday close.
- Paychex reminder/appointment pattern: Thursday.
- Paychex direct-deposit rule: payroll submitted two banking days before check date after 5:00 PM local time may incur a $75 premium processing fee.
- Control target: finalize and submit by Thursday before 5:00 PM Pacific when the Monday check-date pattern remains active.
- Current Paychex check date, holds, Recovery/HRS state, and TAA implementation status override the historical pattern if Paychex changes them.

## 7. Banking & Treasury Operations
Bluevine is active only when confirmed by provider/connected-account evidence. Mercury and other deprecated institutions are historical/reference only. Vendor bills are accounts payable; customer invoices are accounts receivable. No transfer or settlement is complete without provider proof.

## 8. Security & Access Control
Use provider-supported OAuth/passkeys/biometrics. Keep secrets in secret stores/environment configuration. Require auditability. Security PRs require test/CI evidence before merge when required/available.

### Repository security repair rule
Security/dependency PRs follow: detect → verify current head SHA → rebase stale branch → run repository-appropriate CI/tests → repair CI/config → merge only passing unchanged head → post-merge recheck → update 25-repository control issue.

## 9. Reporting Standards
Every operational metric exposes source, timestamp/freshness, and verification state. Without evidence display `DATA UNAVAILABLE` or `UNVERIFIED`.

## 10. Records Retention
Preserve original evidence according to applicable legal, tax, payroll, contractual, and operational requirements.

## 11. Archive & Deletion Rules
Classify `ACTIVE`, `PRESERVED`, `ARCHIVED`, or `SUPERSEDED`. Duplicate detection alone never authorizes deletion. Preserve lineage.

## 12. AI Agent Rules
Agents may ingest, classify, reconcile, draft, retry safe reads, and alert. They may not fabricate evidence, bypass provider controls, expose secrets, or mark consequential actions complete without proof and appropriate authorization.

## 13. Emergency Procedures
Preserve evidence, stop destructive automation, secure credentials, record incident state, restore verified backups, and verify before returning green.

## 14. Business Continuity
Maintain recoverable backups, canonical repository mapping, SSOT lineage, evidence preservation, and documented recovery.

## 15. Executive Dashboard Standards
`System Health · Open Gates · Intake · SSOT · Evidence · Payroll · Banking · Customers/Invoices · Funding · Contracts · Reports · EVE · Security`

Green = verified; yellow = pending/review; red = blocked/failed. Simulated/demo data is explicitly separated.

## iPhone Intake Standard
`Share → QSLC Intake → Receipt`

Backend: `Receive → Task ID → Preserve Original → Dedupe/Lineage → Classify/OCR → Evidence Registry → Domain SSOT → Control Tower`

## Automation Roadmap
1. CEO Command Center
2. Executive Daily Brief
3. Evidence OCR Processor
4. Duplicate File Scanner
5. SSOT Validation Engine
6. Banking Health Dashboard
7. Payroll Reconciliation Center
8. EVE Memory Graph
9. Contract Intelligence Center
10. Operational Readiness / Evidence Completeness Engine
