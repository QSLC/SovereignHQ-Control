// Conscious Energy Continuum (CEC) — energy metrics and flow visualization

var cecChart = null;

function loadCEC() {
  var el = document.getElementById('cecContent');
  if (!el) return;

  el.innerHTML =
    '<div class="stats-grid cec-stats">' +
      '<div class="stat-card"><div class="stat-label">Energy Output</div><div class="stat-value">847 kWh</div></div>' +
      '<div class="stat-card"><div class="stat-label">Continuum Flow</div><div class="stat-value">92.4%</div></div>' +
      '<div class="stat-card"><div class="stat-label">Consciousness Index</div><div class="stat-value">7.8 / 10</div></div>' +
      '<div class="stat-card"><div class="stat-label">Sovereign Nodes</div><div class="stat-value">14</div></div>' +
    '</div>' +
    '<div class="panel cec-panel">' +
      '<h3>Energy Flow — 7 Day Continuum</h3>' +
      '<div class="chart-wrap"><canvas id="cecChart"></canvas></div>' +
    '</div>' +
    '<div class="panel cec-panel">' +
      '<h3>Consciousness Metrics</h3>' +
      '<div class="cec-metrics">' +
        '<div class="cec-metric"><span>Cognition</span><div class="cec-bar"><div class="cec-bar-fill" style="width:85%"></div></div><span>85%</span></div>' +
        '<div class="cec-metric"><span>Resonance</span><div class="cec-bar"><div class="cec-bar-fill" style="width:72%"></div></div><span>72%</span></div>' +
        '<div class="cec-metric"><span>Coherence</span><div class="cec-bar"><div class="cec-bar-fill" style="width:91%"></div></div><span>91%</span></div>' +
        '<div class="cec-metric"><span>Sovereignty</span><div class="cec-bar"><div class="cec-bar-fill" style="width:100%"></div></div><span>100%</span></div>' +
      '</div>' +
    '</div>';

  // Render CEC chart
  if (typeof Chart !== 'undefined') {
    var ctx = document.getElementById('cecChart');
    if (ctx) {
      cecChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Energy Flow',
            data: [72, 78, 85, 80, 92, 88, 95],
            borderColor: '#64ffda',
            backgroundColor: 'rgba(100, 255, 218, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#64ffda'
          }, {
            label: 'Consciousness',
            data: [65, 70, 75, 73, 78, 76, 80],
            borderColor: '#a371f7',
            backgroundColor: 'rgba(163, 113, 247, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#a371f7'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8892b0', font: { size: 11 } } } },
          scales: {
            y: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { color: 'rgba(136, 146, 176, 0.08)' } },
            x: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }
  }
}
