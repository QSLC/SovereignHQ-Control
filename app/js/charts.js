// Dashboard Charts — auto-populated revenue, sales, hours visualizations

var dashboardCharts = {};

// Auto-generated sample data (replaced by real Supabase data when available)
function getAutoRevenueData() {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  var base = [1200, 1900, 1500, 2400, 2800, 3200, 3500, 4100, 3800];
  // If real revenue stat exists, scale to match
  var statEl = document.getElementById('statRevenue');
  if (statEl) {
    var total = parseInt(statEl.textContent.replace(/[$,]/g, '')) || 0;
    if (total > 0) {
      var sum = base.reduce(function (a, b) { return a + b; }, 0);
      var scale = total / sum;
      base = base.map(function (v) { return Math.round(v * scale); });
    }
  }
  return { labels: months, data: base };
}

function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  var revData = getAutoRevenueData();

  // Revenue trend — line chart
  var ctx1 = document.getElementById('revenueChart');
  if (ctx1 && !dashboardCharts.revenue) {
    dashboardCharts.revenue = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: revData.labels,
        datasets: [{
          label: 'Revenue',
          data: revData.data,
          borderColor: '#64ffda',
          backgroundColor: 'rgba(100, 255, 218, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#64ffda'
        }]
      },
      options: chartOpts()
    });
  }

  // Sales by category — doughnut chart
  var ctx2 = document.getElementById('salesChart');
  if (ctx2 && !dashboardCharts.sales) {
    dashboardCharts.sales = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Books', 'PDFs', 'Templates', 'Services'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: ['#64ffda', '#4d9b7e', '#3a7a64', '#2a5a48'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#8892b0', font: { size: 11 } } } }
      }
    });
  }

  // Hours logged — bar chart
  var ctx3 = document.getElementById('hoursChart');
  if (ctx3 && !dashboardCharts.hours) {
    dashboardCharts.hours = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        datasets: [{
          label: 'Hours',
          data: [28, 35, 22, 40],
          backgroundColor: 'rgba(100, 255, 218, 0.4)',
          borderColor: '#64ffda',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: chartOpts()
    });
  }
}

function chartOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { color: 'rgba(136, 146, 176, 0.08)' } },
      x: { ticks: { color: '#8892b0', font: { size: 10 } }, grid: { display: false } }
    }
  };
}
