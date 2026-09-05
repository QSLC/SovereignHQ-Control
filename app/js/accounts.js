// Accounts & Deployment — financial overview, AP/AR, deployment readiness, system inventory

var DEPLOY_CHECKLIST = [
  { item: 'Dashboard with charts', status: 'ready' },
  { item: 'Store with Stripe checkout', status: 'ready' },
  { item: 'Calendar + Time Log', status: 'ready' },
  { item: 'System (Docker health)', status: 'ready' },
  { item: 'Space (NASA feed)', status: 'ready' },
  { item: 'EVE HEI system tree', status: 'ready' },
  { item: 'CEC energy metrics', status: 'ready' },
  { item: 'Deploy (Cloudflare links)', status: 'ready' },
  { item: 'KDP Book Generator', status: 'ready' },
  { item: 'PSI Coin dashboard', status: 'ready' },
  { item: 'Accounts & Financial', status: 'ready' },
  { item: 'Pricing tiers (Stripe)', status: 'ready' },
  { item: 'Help Agent (rule-based)', status: 'ready' },
  { item: 'Google Drive sync', status: 'pending', note: 'Needs GOOGLE_CLIENT_ID' },
  { item: 'Supabase database', status: 'pending', note: 'Needs credentials' },
  { item: 'CLI EVE terminal', status: 'planned' },
  { item: 'Multi-node mesh deploy', status: 'planned' },
  { item: 'AI agent (LLM-powered)', status: 'blocked', note: 'Credits exhausted until Oct 1' }
];

var SYSTEM_INVENTORY = [
  { tab: 'Dashboard', features: 'Stats, charts, activity', status: 'ready' },
  { tab: 'Store', features: 'Products, Stripe, pricing tiers', status: 'ready' },
  { tab: 'Calendar', features: 'Events, deadlines', status: 'ready' },
  { tab: 'Time Log', features: 'Hours, payroll', status: 'ready' },
  { tab: 'System', features: 'Docker, nginx, health', status: 'ready' },
  { tab: 'Space', features: 'Star map, ISS, APOD, Mars, gallery, planets, blueprints', status: 'ready' },
  { tab: 'EVE HEI', features: 'System tree, mind map', status: 'ready' },
  { tab: 'CEC', features: 'Energy flow, consciousness', status: 'ready' },
  { tab: 'Deploy', features: 'Cloudflare, hardware, roadmap', status: 'ready' },
  { tab: 'KDP', features: 'Book generator, export', status: 'ready' },
  { tab: 'PSI Coin', features: 'Market, buy, allocation', status: 'ready' },
  { tab: 'Accounts', features: 'AP/AR, checklist, inventory', status: 'ready' }
];

function loadAccounts() {
  var el = document.getElementById('accountsContent');
  if (!el) return;

  var arAmount = 12450;
  var apAmount = 3200;
  var netProfit = arAmount - apAmount;

  el.innerHTML =
    '<div class="stats-grid">' +
      '<div class="stat-card"><div class="stat-label">Accounts Receivable</div><div class="stat-value psi-up">$' + arAmount.toLocaleString() + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Accounts Payable</div><div class="stat-value psi-down">$' + apAmount.toLocaleString() + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Net Profit</div><div class="stat-value">$' + netProfit.toLocaleString() + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">PSI Holdings</div><div class="stat-value">50K PSI</div></div>' +
    '</div>' +

    '<div class="panel"><h3>Revenue vs Expenses</h3><div class="chart-wrap"><canvas id="acctsChart"></canvas></div></div>' +

    '<div class="panel"><h3>\ud83d\ude80 Deployment Readiness</h3>' +
      '<div class="deploy-checklist">' +
        DEPLOY_CHECKLIST.map(function (c) {
          var icon = c.status === 'ready' ? '\u2705' : c.status === 'pending' ? '\u23f3' : c.status === 'planned' ? '\u2796' : '\u26d4';
          return '<div class="checklist-item">' +
            '<span class="checklist-icon">' + icon + '</span>' +
            '<span class="checklist-text">' + c.item + (c.note ? ' \u2014 <em>' + c.note + '</em>' : '') + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="checklist-summary">' +
        DEPLOY_CHECKLIST.filter(function(c){return c.status==='ready'}).length + ' ready \u2022 ' +
        DEPLOY_CHECKLIST.filter(function(c){return c.status==='pending'}).length + ' pending \u2022 ' +
        DEPLOY_CHECKLIST.filter(function(c){return c.status==='planned'}).length + ' planned \u2022 ' +
        DEPLOY_CHECKLIST.filter(function(c){return c.status==='blocked'}).length + ' blocked' +
      '</div>' +
    '</div>' +

    '<div class="panel"><h3>\ud83d\udd17 System Inventory</h3>' +
      '<div class="inventory-grid">' +
        SYSTEM_INVENTORY.map(function (s) {
          return '<div class="inv-card">' +
            '<div class="inv-tab">' + s.tab + '</div>' +
            '<div class="inv-features">' + s.features + '</div>' +
            '<div class="inv-status inv-' + s.status + '">' + s.status.toUpperCase() + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';

  renderAcctsChart();
}

function renderAcctsChart() {
  if (typeof Chart === 'undefined') return;
  var ctx = document.getElementById('acctsChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      datasets: [
        { label: 'Revenue', data: [1200, 1900, 1500, 2400, 2800, 3200, 3500, 4100, 3800], backgroundColor: 'rgba(100,255,218,0.4)', borderColor: '#64ffda', borderWidth: 1, borderRadius: 4 },
        { label: 'Expenses', data: [600, 700, 650, 800, 850, 900, 950, 1000, 900], backgroundColor: 'rgba(255,107,107,0.3)', borderColor: '#ff6b6b', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8892b0', font: { size: 11 } } } },
      scales: {
        y: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { color: 'rgba(136,146,176,0.08)' } },
        x: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}
