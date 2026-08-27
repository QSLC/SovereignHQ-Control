# QSLC SovereignHQ — Free-First Web App

A deployable PWA for Quantum Sovereign Logistics Corp.
Built with GitHub + Cloudflare Pages + Supabase Free + Stripe.

## Architecture
iPhone (Home Screen PWA)
  -> Cloudflare Pages ($0)
  -> Supabase ($0 starter tier: 500MB DB, 1GB storage, 50K MAU)
  -> Stripe ($0 until a customer pays: 2.9% + 30c per transaction)
  -> GitHub (source code + automation)

## Features
- Product catalog (books, PDFs, templates)
- Customer login/auth (via Supabase Auth)
- Purchase records and download delivery
- Sales dashboard
- Mobile-first PWA (installable on iPhone Home Screen)
- Calendar/action tracking
- Command-center UI

## Setup

### 1. Supabase
- Create a free project at supabase.com
- Run supabase/schema.sql in the SQL Editor
- Copy your Project URL and anon key into .env

### 2. Stripe
- Create a free account at stripe.com
- Get your Publishable Key (pk_test_... for testing)
- Add it to .env

### 3. Cloudflare Pages
- Go to pages.cloudflare.com
- Connect your GitHub repo
- Build command: none (static site)
- Output directory: / (root)
- Add environment variables from .env

### 4. Deploy
- Push to GitHub -> Cloudflare auto-deploys
- Add the site to your iPhone Home Screen

## Environment Variables
Copy .env.example to .env and fill in:
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  STRIPE_PUBLISHABLE_KEY=pk_test_your-key
