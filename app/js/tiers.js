// Stripe Pricing Tiers — sovereign subscription plans

var PRICING_TIERS = [
  {
    name: 'Sovereign Starter',
    price: 2900,
    desc: 'Essential sovereign operations',
    features: ['Dashboard with charts', 'Calendar + Time Log', 'Store (basic)', 'Space feed (APOD)', 'Email support'],
    cta: 'Subscribe',
    highlight: false
  },
  {
    name: 'Sovereign Pro',
    price: 9900,
    desc: 'Full sovereign system access',
    features: ['Everything in Starter', 'EVE HEI Core Brain', 'CEC energy charts', 'Google Drive sync', 'Mars + NASA archive', 'Priority support'],
    cta: 'Go Pro',
    highlight: true
  },
  {
    name: 'Sovereign Enterprise',
    price: 29900,
    desc: 'Maximum sovereignty',
    features: ['Everything in Pro', 'Deploy + Cloudflare Tunnel mgmt', 'CLI EVE access', 'Custom integrations', 'Dedicated node', '24/7 sovereign support'],
    cta: 'Contact Sales',
    highlight: false
  }
];

function loadPricingTiers() {
  var el = document.getElementById('pricingTiers');
  if (!el) return;
  el.innerHTML = '<div class="pricing-grid">' + PRICING_TIERS.map(function (t) {
    return '<div class="pricing-card' + (t.highlight ? ' pricing-highlight' : '') + '">' +
      (t.highlight ? '<div class="pricing-badge">Most Popular</div>' : '') +
      '<div class="pricing-name">' + t.name + '</div>' +
      '<div class="pricing-price">$' + (t.price / 100) + '<span>/mo</span></div>' +
      '<div class="pricing-desc">' + t.desc + '</div>' +
      '<ul class="pricing-features">' + t.features.map(function (f) { return '<li>\u2714 ' + f + '</li>'; }).join('') + '</ul>' +
      '<button class="btn ' + (t.highlight ? 'btn-primary' : 'btn-outline') + ' btn-block" onclick="subscribeTier(\'' + t.name + '\', ' + t.price + ')">' + t.cta + '</button>' +
    '</div>';
  }).join('') + '</div>';
}

function subscribeTier(name, priceCents) {
  if (typeof createStripeCheckout === 'function') {
    createStripeCheckout(name, priceCents);
  } else if (window.Stripe && window.__ENV__ && window.__ENV__.STRIPE_PUBLISHABLE_KEY && window.__ENV__.STRIPE_PUBLISHABLE_KEY !== 'PLACEHOLDER_STRIPE_PK') {
    var stripe = Stripe(window.__ENV__.STRIPE_PUBLISHABLE_KEY);
    alert('Redirecting to Stripe checkout for ' + name + '...');
  } else {
    alert('Stripe not configured.\n\nTo enable payments:\n1. Add your Stripe publishable key via the Secrets page\n2. Set up a payment link in your Stripe dashboard\n3. Tier: ' + name + ' ($' + (priceCents / 100) + '/mo)');
  }
}
