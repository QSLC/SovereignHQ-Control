// PSI Coin — sovereign token market dashboard with purchase links

var psiChart = null;
var psiPrice = 0.042;
var psiHistory = [];
var psiTimer = null;

var PSI_DATA = {
  name: 'PSI Coin',
  symbol: 'PSI',
  supply: 1000000000,
  circulating: 420000000,
  holders: 12847,
  yourHoldings: 50000,
  allocation: [
    { label: 'Founders', value: 40, color: '#64ffda' },
    { label: 'Public Sale', value: 30, color: '#a371f7' },
    { label: 'Team', value: 15, color: '#4d9b7e' },
    { label: 'Reserve', value: 10, color: '#3a7a64' },
    { label: 'Community', value: 5, color: '#2a5a48' }
  ]
};

function loadPsiCoin() {
  var el = document.getElementById('psiContent');
  if (!el) return;

  // Generate 7-day price history
  psiHistory = [];
  var base = 0.038;
  for (var i = 0; i < 30; i++) {
    base += (Math.random() - 0.45) * 0.002;
    psiHistory.push(Math.max(0.01, base));
  }
  psiPrice = psiHistory[psiHistory.length - 1];

  var prev24h = psiHistory[psiHistory.length - 24] || psiHistory[0];
  var change = ((psiPrice - prev24h) / prev24h * 100).toFixed(2);
  var changePositive = parseFloat(change) >= 0;

  el.innerHTML =
    '<div class="psi-header">' +
      '<div class="psi-price-block">' +
        '<div class="psi-symbol">\ud83e\ude99 ' + PSI_DATA.symbol + '</div>' +
        '<div class="psi-price">$' + psiPrice.toFixed(4) + '</div>' +
        '<div class="psi-change ' + (changePositive ? 'psi-up' : 'psi-down') + '">' + (changePositive ? '\u25B2' : '\u25BC') + ' ' + Math.abs(change) + '% (24h)</div>' +
      '</div>' +
      '<div class="psi-metrics">' +
        '<div class="psi-metric"><div class="psi-metric-label">Market Cap</div><div class="psi-metric-value">$' + (psiPrice * PSI_DATA.circulating / 1000000).toFixed(2) + 'M</div></div>' +
        '<div class="psi-metric"><div class="psi-metric-label">Circulating</div><div class="psi-metric-value">' + (PSI_DATA.circulating / 1000000).toFixed(0) + 'M ' + PSI_DATA.symbol + '</div></div>' +
        '<div class="psi-metric"><div class="psi-metric-label">Total Supply</div><div class="psi-metric-value">' + (PSI_DATA.supply / 1000000).toFixed(0) + 'M ' + PSI_DATA.symbol + '</div></div>' +
        '<div class="psi-metric"><div class="psi-metric-label">Holders</div><div class="psi-metric-value">' + PSI_DATA.holders.toLocaleString() + '</div></div>' +
      '</div>' +
    '</div>' +

    '<div class="panel"><h3>Price Chart \u2014 7 Day</h3><div class="chart-wrap"><canvas id="psiChart"></canvas></div></div>' +

    '<div class="panel"><h3>Quick Buy PSI Coin</h3>' +
      '<div class="psi-buy-grid">' +
        '<button class="psi-buy-btn" onclick="buyPsiCoin(100)">100 PSI<br><span>$' + (100 * psiPrice).toFixed(2) + '</span></button>' +
        '<button class="psi-buy-btn" onclick="buyPsiCoin(500)">500 PSI<br><span>$' + (500 * psiPrice).toFixed(2) + '</span></button>' +
        '<button class="psi-buy-btn" onclick="buyPsiCoin(1000)">1,000 PSI<br><span>$' + (1000 * psiPrice).toFixed(2) + '</span></button>' +
        '<button class="psi-buy-btn" onclick="buyPsiCoin(5000)">5,000 PSI<br><span>$' + (5000 * psiPrice).toFixed(2) + '</span></button>' +
      '</div>' +
      '<div class="psi-holdings">' +
        '<div class="psi-holdings-label">Your Holdings</div>' +
        '<div class="psi-holdings-value">' + PSI_DATA.yourHoldings.toLocaleString() + ' PSI</div>' +
        '<div class="psi-holdings-usd">\u2248 $' + (PSI_DATA.yourHoldings * psiPrice).toFixed(2) + ' USD</div>' +
      '</div>' +
    '</div>' +

    '<div class="panel"><h3>Token Allocation</h3><div class="chart-wrap"><canvas id="psiAllocChart"></canvas></div></div>' +
    '<div class="psi-disclaimer">PSI Coin is a sovereign utility token for the QSLC system. Purchases are processed via Stripe. No critical system data is exposed.</div>';

  renderPsiCharts();
  startPsiTicker();
}

function renderPsiCharts() {
  if (typeof Chart === 'undefined') return;

  var ctx = document.getElementById('psiChart');
  if (ctx) {
    psiChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: psiHistory.map(function (_, i) { return 'D' + (i + 1); }),
        datasets: [{
          data: psiHistory,
          borderColor: '#64ffda',
          backgroundColor: 'rgba(100, 255, 218, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#8892b0', font: { size: 10 }, callback: function(v) { return '$' + v.toFixed(3); } }, grid: { color: 'rgba(136,146,176,0.08)' } },
          x: { display: false }
        }
      }
    });
  }

  var allocCtx = document.getElementById('psiAllocChart');
  if (allocCtx) {
    new Chart(allocCtx, {
      type: 'doughnut',
      data: {
        labels: PSI_DATA.allocation.map(function (a) { return a.label; }),
        datasets: [{
          data: PSI_DATA.allocation.map(function (a) { return a.value; }),
          backgroundColor: PSI_DATA.allocation.map(function (a) { return a.color; }),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#8892b0', font: { size: 11 } } } }
      }
    });
  }
}

function startPsiTicker() {
  if (psiTimer) clearInterval(psiTimer);
  psiTimer = setInterval(function () {
    psiPrice += (Math.random() - 0.5) * 0.0005;
    psiPrice = Math.max(0.001, psiPrice);
    psiHistory.push(psiPrice);
    if (psiHistory.length > 30) psiHistory.shift();
    if (psiChart) {
      psiChart.data.labels.push('D' + (psiHistory.length + 1));
      psiChart.data.labels.shift();
      psiChart.data.datasets[0].data = psiHistory;
      psiChart.update('none');
    }
    var priceEl = document.querySelector('.psi-price');
    if (priceEl) priceEl.textContent = '$' + psiPrice.toFixed(4);
  }, 5000);
}

function buyPsiCoin(amount) {
  var total = (amount * psiPrice).toFixed(2);
  if (typeof subscribeTier === 'function') {
    subscribeTier('PSI Coin \u2014 ' + amount + ' PSI', Math.round(parseFloat(total) * 100));
  } else {
    alert('Purchase ' + amount + ' PSI Coin for $' + total + '\n\nStripe checkout will be available once your Stripe key is configured.');
  }
}

function stopPsiTicker() {
  if (psiTimer) { clearInterval(psiTimer); psiTimer = null; }
}
