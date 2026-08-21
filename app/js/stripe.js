// Stripe Checkout Integration
// Uses Stripe Checkout (redirect-based) — no backend needed for basic flow
// For production: create a Supabase Edge Function to create checkout sessions

const STRIPE_PK = window.__ENV__?.STRIPE_PUBLISHABLE_KEY || 'pk_test_your-key';
let stripe;

try {
  stripe = Stripe(STRIPE_PK);
} catch (e) {
  console.error('Stripe init failed:', e);
  stripe = null;
}

async function purchaseProduct(product) {
  if (!stripe) {
    alert('Stripe not configured. Add your publishable key to .env');
    return;
  }

  // For the free-first version, we redirect to Stripe Checkout
  // In production, you'd create a checkout session via a Supabase Edge Function
  // that uses your Stripe secret key to create the session server-side
  
  // For now: if product has a stripe_price_id, use it
  if (product.stripe_price_id) {
    // Redirect to Stripe Checkout
    // You'll need to create a Supabase Edge Function for this
    // For now, show instructions
    alert('Stripe Checkout ready! Create a Supabase Edge Function to handle checkout sessions. See README for setup.');
  } else {
    // No Stripe price set up yet
    alert('This product needs a Stripe Price ID. Add it in the Admin panel.');
  }
}

// Future: Supabase Edge Function for checkout
// async function createCheckoutSession(product) {
//   const { data, error } = await supabase.functions.invoke('create-checkout', {
//     body: { price_id: product.stripe_price_id, product_id: product.id }
//   });
//   if (data?.url) window.location.href = data.url;
// }
