// Help Agent — floating knowledge base (rule-based, no LLM required)

var AGENT_KB = [
  { q: 'How do I connect Google Drive?', a: 'Go to the Space tab, find the Google Drive Sync panel, and click Connect. You need a Google OAuth Client ID from the Google Cloud Console. Only NASA visuals and star maps are synced — your personal data stays private.' },
  { q: 'What is EVE HEI?', a: 'EVE HEI is the core brain of the QSLC Sovereign System. It orchestrates all subsystems: Technical Architecture, Sovereign Data Layer, Financial Operations, CEC, and Deployment. Visit the EVE HEI tab to see the full system tree.' },
  { q: 'What is CEC?', a: 'The Conscious Energy Continuum (CEC) tracks energy flow, consciousness metrics, and sovereignty index. Visit the CEC tab for live charts and metrics.' },
  { q: 'How do Stripe tiers work?', a: 'Visit the Store tab to see three pricing tiers: Sovereign Starter ($29), Pro ($99), and Enterprise ($299). Click Subscribe to go through Stripe checkout.' },
  { q: 'Is my data private?', a: 'Yes. Your personal, financial, and paycheck data stays in your private Supabase database. Only NASA visuals and star maps sync to Google Drive. Sovereign data stays sovereign.' },
  { q: 'How do I deploy to Cloudflare?', a: 'Visit the Deploy tab for Cloudflare Tunnel links, hardware status, and the corporate roadmap. The system runs on a ROG Ally X with Docker + nginx.' },
  { q: 'What is qslc-hei.com?', a: 'qslc-hei.com is the sovereign system domain. Find the link in the Deploy tab under Connectivity.' },
  { q: 'How do I view charts?', a: 'The Dashboard tab has revenue, sales, and hours charts. The CEC tab has energy flow and consciousness charts.' }
];

function initHelpAgent() {
  if (document.getElementById('helpAgentBtn')) return;

  var btn = document.createElement('button');
  btn.id = 'helpAgentBtn';
  btn.className = 'help-agent-btn';
  btn.innerHTML = '\ud83e\udde9';
  btn.title = 'Help Agent';
  btn.onclick = toggleHelpAgent;
  document.body.appendChild(btn);

  var panel = document.createElement('div');
  panel.id = 'helpAgentPanel';
  panel.className = 'help-agent-panel hidden';
  panel.innerHTML =
    '<div class="help-agent-header">' +
      '<span>EVE Agent</span>' +
      '<button class="help-agent-close" onclick="toggleHelpAgent()">\u00d7</button>' +
    '</div>' +
    '<input type="text" id="helpAgentSearch" class="help-agent-search" placeholder="Ask about the system..." oninput="filterHelpAgent(this.value)">' +
    '<div id="helpAgentResults" class="help-agent-results"></div>';
  document.body.appendChild(panel);

  renderHelpAgentResults('');
}

function toggleHelpAgent() {
  var panel = document.getElementById('helpAgentPanel');
  if (panel) panel.classList.toggle('hidden');
}

function filterHelpAgent(query) {
  renderHelpAgentResults(query);
}

function renderHelpAgentResults(query) {
  var el = document.getElementById('helpAgentResults');
  if (!el) return;
  var q = (query || '').toLowerCase();
  var filtered = q ? AGENT_KB.filter(function (item) {
    return item.q.toLowerCase().indexOf(q) > -1 || item.a.toLowerCase().indexOf(q) > -1;
  }) : AGENT_KB;

  if (filtered.length === 0) {
    el.innerHTML = '<div class="help-agent-no-results">No results. Try: "google drive", "stripe", "cec", "cloudflare"</div>';
    return;
  }

  el.innerHTML = filtered.map(function (item, i) {
    return '<div class="help-agent-item" onclick="toggleHelpAnswer(' + i + ')">' +
      '<div class="help-agent-q">' + item.q + '</div>' +
      '<div class="help-agent-a hidden" id="helpAnswer' + i + '">' + item.a + '</div>' +
      '</div>';
  }).join('');
}

function toggleHelpAnswer(i) {
  var el = document.getElementById('helpAnswer' + i);
  if (el) el.classList.toggle('hidden');
}

// Self-initialize — independent of app.js DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHelpAgent);
} else {
  initHelpAgent();
}
