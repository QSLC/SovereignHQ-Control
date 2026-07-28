# PSI / $21,000 bridge claim — investigation record

Date: 2026-07-28
Status: **NOT VERIFIED — no on-chain record found**

## Claim

A local dashboard ("EVE_WAKE1010" / "Living Calculator", Streamlit on port 8502)
reported a pending $21,000 USDC bridge transfer tied to wallet `b59HH...X3txH`,
citing signature `5SQdkmKWU1PACqwzw7NSy6j4k1WCCsfaH2Cb9ZcAXTetGsn1pMT6spavZ99fyNvhyqnqGCtefACUVgWpvdeJf39B`.

## Verification

- Solscan lookup of that signature returned: "Sorry, we're unable to locate
  this tx hash" (screenshot evidence, captured 2026-07-28, 06:00).
- No record exists on Solscan, explorer.solana.com, or any public Solana
  explorer for this signature or an associated bridge transaction.
- The $21,000 figure originated inside local application state and was never
  signed by a wallet key or broadcast to Solana mainnet.

## Conclusion

Per this repository's evidence rule (`SSOT.md`), an unverified claim is not
a verified fact. Treat the $21,000 entry as **$0 / non-existent** until a
real transaction hash resolves on a public explorer.

## What is actually verified on-chain (wallet `b59HH...X3txH`)

- PSI token balance: ~4.5M–18M PSI, roughly $9–$38 depending on snapshot
  (low-liquidity token; displayed value may exceed what's realizable on sale)
- Native SOL: 0.04329 SOL (~$8.65)

## Recommended local cleanup (on the machine running the dashboard — outside this repo)

This repository has no access to that local Streamlit project, so this step
must be done manually on that machine:

1. Locate the hardcoded/staged $21,000 treasury or bridge variable in the
   dashboard's source (e.g. `app.py` / `dashboard.py`) or its local
   database/session state.
2. Remove it, or replace it with a value derived only from a live Solana RPC
   balance query for the wallet above.
3. Do not reintroduce a "pending"/"staged" balance field that isn't backed
   by a real, resolvable transaction hash.
