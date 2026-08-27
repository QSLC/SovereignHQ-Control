// Dashboard View — stats and overview

async function loadDashboard() {
  if (!currentUser) {
    document.getElementById('recentActivity').innerHTML = '<div class="empty-state">Sign in to see your data</div>';
    document.getElementById('upcomingDeadlines').innerHTML = '<div class="empty-state">Sign in to see deadlines</div>';
    return;
  }

  // Load sales summary
  try {
    const { data: sales } = await DB.getSalesSummary();
    if (sales) {
      const totalRevenue = sales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount_cents, 0);
      const paidCount = sales.filter(s => s.status === 'paid').length;
      document.getElementById('statRevenue').textContent = formatMoney(totalRevenue);
      document.getElementById('statSales').textContent = paidCount;
    }
  } catch (e) { console.error('Sales load error:', e); }

  // Load time log stats
  try {
    const { data: logs } = await DB.getTimeLogs(currentUser.id);
    if (logs) {
      const totalHours = logs.reduce((sum, l) => sum + parseFloat(l.hours), 0);
      const totalPay = logs.reduce((sum, l) => sum + (l.pay_calculated_cents || 0), 0);
      document.getElementById('statHours').textContent = totalHours.toFixed(1);
      document.getElementById('statPay').textContent = formatMoney(totalPay);
    }
  } catch (e) { console.error('Time log load error:', e); }

  // Recent purchases
  try {
    const { data: purchases } = await DB.getPurchases(currentUser.id);
    const recentEl = document.getElementById('recentActivity');
    if (purchases && purchases.length > 0) {
      recentEl.innerHTML = purchases.slice(0, 5).map(p => `
        <div class="activity-item">
          <span class="activity-desc">${p.products?.title || 'Unknown product'}</span>
          <span class="activity-amount">${p.status === 'paid' ? formatMoney(p.amount_cents) : p.status}</span>
        </div>
      `).join('');
    } else {
      recentEl.innerHTML = '<div class="empty-state">No purchases yet</div>';
    }
  } catch (e) {
    document.getElementById('recentActivity').innerHTML = '<div class="empty-state">Sign in to see activity</div>';
  }

  // Upcoming deadlines
  try {
    const { data: events } = await DB.getEvents(currentUser.id);
    const deadlineEl = document.getElementById('upcomingDeadlines');
    if (events && events.length > 0) {
      const upcoming = events.filter(e => e.status === 'pending').slice(0, 5);
      deadlineEl.innerHTML = upcoming.map(e => {
        const d = formatDate(e.event_date);
        return `
          <div class="deadline-item">
            <div class="deadline-date">
              <div class="month">${d.month}</div>
              <div class="day">${d.day}</div>
            </div>
            <div>
              <div class="deadline-title">${e.title}</div>
              <span class="deadline-cat">${e.category}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      deadlineEl.innerHTML = '<div class="empty-state">No upcoming deadlines</div>';
    }
  } catch (e) {
    deadlineEl.innerHTML = '<div class="empty-state">Sign in to see deadlines</div>';
  }
}
