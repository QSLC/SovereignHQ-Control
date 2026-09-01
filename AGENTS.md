# Base44 Dev Environment

## What this is

A static PWA (HTML/CSS/JS, no build step) for "SovereignHQ Control" (QSLC).
Served by nginx:alpine on port 3000. No backend, no database container — the app
talks directly to Supabase (auth + DB) and Stripe (payments) via client-side SDKs.

## How it runs

- `docker-compose.base44.yml` — single `web` service (nginx:alpine)
- `app/` is bind-mounted at `/usr/share/nginx/html` (read-write, live edits on refresh)
- `docker/nginx.conf` — serves static files; `/env.js` is served from `/tmp/env.js`
  (generated at startup via envsubst from `app/env.template.js`) so secrets never
  touch the repo
- `.env.base44-defaults` — placeholder values so the app boots without credentials
- `/run/base44/app.env` — real secrets (platform-managed, overrides defaults)

## Config injection

`app/env.template.js` is processed by `envsubst` at container startup to produce
`/tmp/env.js`. This sets `window.__ENV__` and individual globals (`window.SUPABASE_URL`
etc.) before any other script loads. The original `app/config.js` is now superseded
by `env.js` (which loads first in index.html).

## Secrets (all optional at boot — app UI renders with placeholders)

| Name | Where to get it |
|------|----------------|
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon public key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → Developers → API keys → Publishable key |

All three are **public/client-side keys** (safe to expose in browser). Without them
the UI renders but Supabase/Stripe calls fail gracefully.

## Verify it works

```sh
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -sf -H "Host: external.preview.example" http://localhost:3000/ | head -5
```

## After edits

- HTML/CSS/JS changes: refresh the preview (nginx serves from bind mount)
- `env.template.js` or compose changes: `docker compose restart web` then reload preview
