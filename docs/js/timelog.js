// Time Log View — track hours and billing

const RATE_CENTS = 7500; // $75.00/hr

async function loadTimeLog() {
  if (!currentUser) {
    document.getElementById('timeLogList').innerHTML = '<div class="empty-state">Sign in to log time</div>';
    return;
  }
  try {
    const { data, error } = await DB.getTimeLogs(currentUser.id);
    if (error) throw error;
    const list = document.getElementById('timeLogList');
    
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty-state">No time entries yet. Log your first session!</div>';
      updateBillingSummary([]);
      return;
    }

    updateBillingSummary(data);

    list.innerHTML = data.map(l => {
      const d = formatDate(l.date);
      return `
        <div class="timelog-item">
          <div class="timelog-info">
            <div class="tl-task">${l.task}</div>
            <div class="tl-date">${d.full}</div>
            ${l.notes ? `<div class="tl-notes">${l.notes}</div>` : ''}
          </div>
          <div class="timelog-pay">
            <div class="tl-amount">${formatMoney(l.pay_calculated_cents || l.hours * RATE_CENTS)}</div>
            <div class="tl-hours">${parseFloat(l.hours).toFixed(1)} hrs</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Time log load error:', e);
    document.getElementById('timeLogList').innerHTML = '<div class="empty-state">Error loading time logs</div>';
  }
}

function updateBillingSummary(logs) {
  const totalHours = logs.reduce((sum, l) => sum + parseFloat(l.hours), 0);
  const totalPay = logs.reduce((sum, l) => sum + (l.pay_calculated_cents || l.hours * RATE_CENTS), 0);
  document.getElementById('periodHours').textContent = totalHours.toFixed(1) + ' hrs';
  document.getElementById('periodPay').textContent = formatMoney(totalPay);
}

async function handleTimeSubmit(e) {
  e.preventDefault();
  const hours = parseFloat(document.getElementById('timeHours').value);
  const data = {
    user_id: currentUser.id,
    date: document.getElementById('timeDate').value,
    task: document.getElementById('timeTask').value,
    hours: hours,
    rate_cents: RATE_CENTS,
    notes: document.getElementById('timeNotes').value || null
  };
  try {
    await DB.createTimeLog(data);
    document.getElementById('timeForm').reset();
    document.getElementById('timeModal').classList.add('hidden');
    loadTimeLog();
    loadDashboard();
  } catch (e) {
    alert('Error logging time: ' + e.message);
  }
}
