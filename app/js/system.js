// System View — Docker container health dashboard

let systemRefreshTimer = null;

async function loadSystemDashboard() {
  clearTimeout(systemRefreshTimer);

  try {
    const resp = await fetch('/api/containers');
    const data = await resp.json();

    if (data.error) {
      renderSystemError(data.error);
      return;
    }

    renderSystemSummary(data.summary);
    renderContainers(data.containers);

    // Auto-refresh every 10s while the view is visible
    if (document.getElementById('view-system').classList.contains('active')) {
      systemRefreshTimer = setTimeout(loadSystemDashboard, 10000);
    }
  } catch (e) {
    renderSystemError(e.message);
  }
}

function renderSystemError(msg) {
  document.getElementById('systemContainers').innerHTML =
    '<div class="empty-state">Unable to reach Docker API<br><span style="font-size:12px;opacity:0.7">' + msg + '</span></div>';
  document.getElementById('sysTotal').textContent = '—';
  document.getElementById('sysRunning').textContent = '—';
  document.getElementById('sysStopped').textContent = '—';
  document.getElementById('sysUnhealthy').textContent = '—';
}

function renderSystemSummary(s) {
  document.getElementById('sysTotal').textContent = s.total;
  document.getElementById('sysRunning').textContent = s.running;
  document.getElementById('sysStopped').textContent = s.stopped;
  document.getElementById('sysUnhealthy').textContent = s.unhealthy;
}

function renderContainers(containers) {
  var el = document.getElementById('systemContainers');
  if (!containers || containers.length === 0) {
    el.innerHTML = '<div class="empty-state">No containers found</div>';
    return;
  }

  el.innerHTML = containers.map(function(c) {
    var running = c.state === 'running';
    var hs = c.health ? c.health.status : null;
    var healthBadge = hs
      ? '<span class="health-badge health-' + hs + '">\u25CF ' + hs + '</span>'
      : '';
    var healthLog = (c.health && c.health.log)
      ? '<div class="health-log">' + escapeHtml(c.health.log) + '</div>'
      : '';

    return '<div class="container-card ' + (running ? '' : 'stopped') + '">' +
      '<div class="container-header">' +
        '<div class="container-name">' + escapeHtml(c.name) + '</div>' +
        '<span class="badge badge-' + (running ? 'running' : 'exited') + '">' + c.state + '</span>' +
      '</div>' +
      '<div class="container-image">' + escapeHtml(c.image) + '</div>' +
      (c.ports.length ? '<div class="container-ports">Ports: ' + c.ports.map(escapeHtml).join(', ') + '</div>' : '') +
      '<div class="container-meta">' +
        '<span class="container-id">' + c.id + '</span>' +
        healthBadge +
      '</div>' +
      healthLog +
      '<div class="container-status-text">' + escapeHtml(c.status) + '</div>' +
    '</div>';
  }).join('');
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
