# Bridge transfer audit playbook

Purpose: give any future investigation (human, EVE, or another agent) a
single repeatable procedure so no bridge claim is ever logged as real money
without a resolvable on-chain record.

Record every finding in `BRIDGE_TRACKER.csv` (schema below) and back each
row with an entry in `EVIDENCE_INDEX.csv`. A row is not "verified" until
every required field in the success condition is filled with a real,
independently-checkable value — not a description of one.

## BridgeTracker schema (`BRIDGE_TRACKER.csv`)

| Field | Meaning |
|---|---|
| `Bridge_ID` | Stable ID, e.g. `BR-YYYY-MMDD-NNN` |
| `Asset` | Token/asset claimed to have moved |
| `Amount` | Amount of that asset |
| `USD_Value` | USD value at time of claim |
| `Source_Wallet` | Sending wallet address |
| `Destination_Wallet` | Receiving wallet address |
| `Source_Chain` / `Destination_Chain` | Chains involved |
| `Bridge_Provider` | Wormhole / Portal / Mayan / deBridge / Stargate / LayerZero / etc. |
| `Source_Tx_Hash` | Tx hash on the source chain |
| `Destination_Tx_Hash` | Tx hash on the destination chain (the redemption) |
| `Wormhole_VAA` | The VAA ID, if Wormhole/Portal — this is the canonical proof a transfer was attested and whether it's been redeemed |
| `Claim_Status` | One of: `COMPLETED`, `PENDING_CLAIM`, `FAILED`, `REFUNDED`, `NOT_VERIFIED_NO_ONCHAIN_RECORD` |
| `Explorer_Link` | A real, clickable URL to the source or destination explorer record |
| `Timestamp` | When the claim was captured/investigated |
| `Evidence_Link` | Cross-reference to the `EvidenceID` in `EVIDENCE_INDEX.csv` |
| `Notes` | Anything else relevant |

## Audit procedure

1. **Enumerate known wallets** — list every wallet address associated with
   QSLC treasury or personal accounts (public addresses only; never store
   private keys or seed phrases here).
2. **Search transaction history** on each wallet's chain, for the bridge
   providers actually in use: Wormhole, Portal, Mayan, deBridge, Stargate,
   LayerZero, or a generic "bridge"/"transfer" match.
3. **Extract**, per transfer found: source/destination wallet, source/dest
   chain, asset, amount, USD value, tx hashes, VAA (if Wormhole/Portal),
   claim status.
4. **Verify status** against the source chain's own explorer — not against
   a local dashboard's cached/staged value:
   - `COMPLETED` — both source and destination tx hashes resolve.
   - `PENDING_CLAIM` — source tx confirmed, VAA issued, destination
     redemption not yet submitted.
   - `FAILED` — source tx exists but reverted, or bridge rejected it.
   - `REFUNDED` — funds returned to source wallet, with its own tx hash.
   - `NOT_VERIFIED_NO_ONCHAIN_RECORD` — no independently resolvable tx hash
     exists anywhere; treat the claimed amount as $0 until this changes.
5. **Write the row** to `BRIDGE_TRACKER.csv`, and a matching entry to
   `EVIDENCE_INDEX.csv` with the screenshot/explorer-lookup evidence.
6. **Reconcile** the sum of `COMPLETED`/verified rows against whatever
   treasury total is being displayed elsewhere (dashboards, spreadsheets).
   Any gap between "displayed total" and "sum of verified rows" is the
   unverified/fabricated portion — report it as a gap, not as pending funds.

## Success condition

A bridge transfer only counts as real, spendable value once its row has:
source wallet, destination wallet, a Source_Tx_Hash, an Explorer_Link that
actually resolves, and a Claim_Status of `COMPLETED`. Anything short of
that — including "staged," "pending local signature," or "in the engine
memory" — stays at `NOT_VERIFIED_NO_ONCHAIN_RECORD` and $0 toward any
balance total.

## Local evidence search (run on the machine holding the records, not here)

This session has no access to your local filesystem (`C:\...`) or any
external network, so the enumeration/search steps above have to be run by
you, or by whatever agent actually has access to that machine and the
relevant chain explorers. A safe, read-only starting point for searching
local files for bridge-related keywords is `powershell/search-bridge-evidence.ps1`
in this repo — it only reads text files and prints matches, it does not
modify, transmit, or delete anything.
