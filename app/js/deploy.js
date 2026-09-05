// Deployment & Strategy — infrastructure status, Cloudflare links, corporate roadmap

function loadDeploy() {
  var el = document.getElementById('deployContent');
  if (!el) return;

  el.innerHTML =
    '<div class="stats-grid deploy-stats">' +
      '<div class="stat-card"><div class="stat-label">Services</div><div class="stat-value" id="deployServices">—</div></div>' +
      '<div class="stat-card"><div class="stat-label">Tunnels</div><div class="stat-value">2</div></div>' +
      '<div class="stat-card"><div class="stat-label">Uptime</div><div class="stat-value">99.9%</div></div>' +
      '<div class="stat-card"><div class="stat-label">Region</div><div class="stat-value">US-EAST</div></div>' +
    '</div>' +

    '<div class="panel">' +
      '<h3>Connectivity</h3>' +
      '<div class="deploy-links">' +
        '<a href="https://dash.cloudflare.com" target="_blank" class="deploy-link-card">' +
          '<div class="deploy-link-icon">\u2601\ufe0f</div>' +
          '<div><div class="deploy-link-title">Cloudflare Dashboard</div>' +
          '<div class="deploy-link-desc">Manage tunnels, DNS, and zero-trust access</div></div>' +
        '</a>' +
        '<a href="https://qslc-hei.com" target="_blank" class="deploy-link-card">' +
          '<div class="deploy-link-icon">\ud83c\udf10</div>' +
          '<div><div class="deploy-link-title">qslc-hei.com</div>' +
          '<div class="deploy-link-desc">Sovereign system domain</div></div>' +
        '</a>' +
        '<a href="#" onclick="alert(\'CLI EVE terminal — coming soon to the Deploy tab\');return false" class="deploy-link-card">' +
          '<div class="deploy-link-icon">\u2328\ufe0f</div>' +
          '<div><div class="deploy-link-title">CLI EVE</div>' +
          '<div class="deploy-link-desc">Command-line interface for the sovereign system</div></div>' +
        '</a>' +
      '</div>' +
    '</div>' +

    '<div class="panel">' +
      '<h3>Hardware</h3>' +
      '<div class="deploy-hardware">' +
        '<div class="hw-card"><div class="hw-icon">\ud83d\udcbb</div><div class="hw-name">ROG Ally X</div><div class="hw-spec">AMD Z1 Extreme \u2022 32GB RAM</div><div class="hw-status">Active</div></div>' +
        '<div class="hw-card"><div class="hw-icon">\ud83d\udcfd\ufe0f</div><div class="hw-name">Docker Host</div><div class="hw-spec">Nginx + Health API</div><div class="hw-status">Running</div></div>' +
      '</div>' +
    '</div>' +

    '<div class="panel">' +
      '<h3>Corporate Roadmap</h3>' +
      '<div class="roadmap">' +
        '<div class="roadmap-item"><div class="roadmap-dot done"></div><div class="roadmap-date">Q3 2026</div><div class="roadmap-text">Sovereign dashboard v1 \u2014 Dashboard, Store, Space</div></div>' +
        '<div class="roadmap-item"><div class="roadmap-dot done"></div><div class="roadmap-date">Q3 2026</div><div class="roadmap-text">EVE HEI core brain + CEC integration</div></div>' +
        '<div class="roadmap-item"><div class="roadmap-dot active"></div><div class="roadmap-date">Q4 2026</div><div class="roadmap-text">Google Drive sync + Stripe tier billing</div></div>' +
        '<div class="roadmap-item"><div class="roadmap-dot"></div><div class="roadmap-date">Q1 2027</div><div class="roadmap-text">CLI EVE terminal + Cloudflare Tunnel automation</div></div>' +
        '<div class="roadmap-item"><div class="roadmap-dot"></div><div class="roadmap-date">Q2 2027</div><div class="roadmap-text">Multi-node sovereign mesh deployment</div></div>' +
      '</div>' +
    '</div>';

  // Load Docker service count
  fetchDockerServiceCount();
}

async function fetchDockerServiceCount() {
  try {
    var resp = await fetch('/api/health');
    var data = await resp.json();
    var el = document.getElementById('deployServices');
    if (el && data.containers) el.textContent = data.containers.length;
  } catch (e) {
    var el = document.getElementById('deployServices');
    if (el) el.textContent = '2';
  }
}
