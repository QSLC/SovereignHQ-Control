# Stripe CLI setup (07_STRIPE_SALES)

Steps to install the Stripe CLI and its plugins on macOS/Linux for QSLC Stripe
operations. Follow the repository's security rule: never commit API keys,
access tokens, or `.env` files (see `SSOT.md` and `README.md`).

## 1. Install the CLI

```sh
brew install stripe/stripe-cli/stripe
```

## 2. Authenticate

Prefer the interactive, browser-based pairing flow — it never puts a raw
secret on the command line or in shell history:

```sh
stripe login
```

This opens a browser to confirm a short-lived pairing code and stores the
resulting credential in the CLI's local config (`~/.config/stripe/config.toml`),
outside this repository.

If a scripted/CI flow is required instead, pass the key via an environment
variable, never as a literal argument:

```sh
export STRIPE_API_KEY="rk_live_..."   # from your secrets manager, not committed
stripe --api-key "$STRIPE_API_KEY" config --list
```

## 3. Install plugins

List what's available, then install by plugin name only:

```sh
stripe plugin list
stripe plugin install <plugin-name>
```

Do not pass an API key, access token, or pairing code as a plugin-install
argument — `stripe plugin install` expects a plugin name (e.g. `apps`,
`portal`), not a credential.

## Where real credentials live

Actual Stripe API keys/tokens must be stored in approved protected storage
(per `README.md` → Security), not in this repository, `.env` files, or shell
history. Commit only references to where a credential is stored, never the
credential itself.
