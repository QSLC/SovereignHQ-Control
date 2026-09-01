// Generated at container startup from environment variables (envsubst).
// This file is loaded BEFORE all other scripts so that Supabase/Stripe
// clients initialize with the correct values.
window.__ENV__ = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}',
  STRIPE_PUBLISHABLE_KEY: '${STRIPE_PUBLISHABLE_KEY}',
  APP_NAME: '${APP_NAME}',
  APP_URL: '${APP_URL}'
};
// Individual globals for app.js compatibility (it reads window.SUPABASE_URL etc.)
window.SUPABASE_URL = '${SUPABASE_URL}';
window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
window.STRIPE_PUBLISHABLE_KEY = '${STRIPE_PUBLISHABLE_KEY}';
