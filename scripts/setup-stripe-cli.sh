#!/usr/bin/env bash
# Installs the Stripe CLI via Homebrew. See docs/stripe-cli-setup.md for
# authentication and plugin-install steps — this script never accepts or
# stores an API key/token.
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required: https://brew.sh" >&2
  exit 1
fi

brew install stripe/stripe-cli/stripe

echo "Stripe CLI installed. Run 'stripe login' to authenticate (see docs/stripe-cli-setup.md)."
