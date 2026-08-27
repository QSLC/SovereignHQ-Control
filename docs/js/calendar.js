// Calendar View — action items and deadlines

async function loadCalendar() {
  if (!currentUser) {
    document.getElementById('calendarList').innerHTML = '<div class="empty-state">Sign in to manage your calendar</div>';
    return;
  }
  try {
    const { data, error } = await DB.getEvents(currentUser.id);
    if (error) throw error;
    const list = document.getElementById('calendarList');
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty-state">No action items. Add one!</div>';
      return;
    }
    list.innerHTML = data.map(e => {
      const d = formatDate(e.event_date);
      return `
        <div class="calendar-item">
          <div class="cal-date">
            <div class="month">${d.month}</div>
            <div class="day">${d.day}</div>
          </div>
          <div class="cal-info">
            <div class="cal-title">${e.title}</div>
            ${e.event_time ? `<div class="cal-time">${e.event_time}</div>` : ''}
            ${e.description ? `<div class="cal-time">${e.description}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <span class="cal-cat">${e.category}</span>
            <span class="cal-status ${e.status}" onclick="toggleEventDone('${e.id}', '${e.status}')">${e.status}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Calendar load error:', e);
    document.getElementById('calendarList').innerHTML = '<div class="empty-state">Error loading calendar</div>';
  }
}

async function toggleEventDone(id, currentStatus) {
  const newStatus = currentStatus === 'done' ? 'pending' : 'done';
  try {
    await DB.updateEventStatus(id, newStatus);
    loadCalendar();
  } catch (e) { console.error('Toggle event error:', e); }
}

async function handleEventSubmit(e) {
  e.preventDefault();
  const data = {
    user_id: currentUser.id,
    title: document.getElementById('eventTitle').value,
    description: document.getElementById('eventDesc').value,
    event_date: document.getElementById('eventDate').value,
    event_time: document.getElementById('eventTime').value || null,
    category: document.getElementById('eventCategory').value
  };
  try {
    await DB.createEvent(data);
    document.getElementById('eventForm').reset();
    document.getElementById('eventModal').classList.add('hidden');
    loadCalendar();
    loadDashboard();
  } catch (e) {
    alert('Error saving event: ' + e.message);
  }
}
