// EVE Control Center — token inventory, system control, content sync, generate commands

var EV_TOKENS = [
  { name: 'SUPABASE_URL', label: 'Supabase URL', group: 'Database', icon: '\ud83d\uddc3\ufe0f' },
  { name: 'SUPABASE_ANON_KEY', label: 'Supabase Anon Key', group: 'Database', icon: '\ud83d\udd11\ufe0f' },
  { name: 'STRIPE_PUBLISHABLE_KEY', label: 'Stripe Publishable Key', group: 'Payments', icon: '\ud83d\udcb3' },
  { name: 'STRIPE_API_KEY', label: 'Stripe Secret Key', group: 'Payments', icon: '\ud83d\udcb3' },
  { name: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret', group: 'Payments', icon: '\ud83d\udd14' },
  { name: 'GOOGLE_CLIENT_ID', label: 'Google OAuth Client ID', group: 'Integrations', icon: '\ud83d\udd17' },
  { name: 'CLOUDFLARE_ZONE_ID', label: 'Cloudflare Zone ID', group: 'Infrastructure', icon: '\u2601\ufe0f' },
  { name: 'WSDOT_ACCESS_CODE', label: 'WSDOT Access Code', group: 'Integrations', icon: '\ud83d\ude98' }
];

var EVE_CONTROLS = [
  { tab: 'dashboard', label: 'Dashboard', icon: '\u25c8', desc: 'Revenue, charts, activity' },
  { tab: 'store', label: 'Store', icon: '\u25b4', desc: 'Products, Stripe checkout' },
  { tab: 'calendar', label: 'Calendar', icon: '\u25bd', desc: 'Events, deadlines, iCal sync' },
  { tab: 'timelog', label: 'Time Log', icon: '\u23f1', desc: 'Hours, payroll, billing' },
  { tab: 'system', label: 'System', icon: '\u26a1', desc: 'Docker, nginx, health' },
  { tab: 'space', label: 'Space', icon: '\ud83c\udf0c', desc: 'NASA, planets, blueprints' },
  { tab: 'kdp', label: 'KDP Books', icon: '\ud83d\udcda', desc: 'Book generator, export' },
  { tab: 'psi', label: 'PSI Coin', icon: '\ud83e\ude99', desc: 'Token market, buy' },
  { tab: 'cec', label: 'CEC', icon: '\u26a1', desc: 'Energy, consciousness' },
  { tab: 'deploy', label: 'Deploy', icon: '\ud83d\ude80', desc: 'Cloudflare, hardware' },
  { tab: 'accounts', label: 'Accounts', icon: '\ud83d\udcb0', desc: 'AP/AR, checklist' }
];

function loadEveControl() {
  var el = document.getElementById('eveControlPanel');
  if (!el) return;

  // Token inventory
  var tokensHtml = EV_TOKENS.map(function (t) {
    var val = (window.__ENV__ && window.__ENV__[t.name]) || window[t.name] || '';
    var configured = val && !val.startsWith('placeholder') && !val.startsWith('pk_test_placeholder') && val !== 'your-anon-key-here' && val !== '';
    return '<div class="ev-token ' + (configured ? 'ev-ok' : 'ev-missing') + '">' +
      '<span class="ev-token-icon">' + t.icon + '</span>' +
      '<div class="ev-token-info">' +
        '<div class="ev-token-label">' + t.label + '</div>' +
        '<div class="ev-token-group">' + t.group + '</div>' +
      '</div>' +
      '<span class="ev-token-status">' + (configured ? '\u2705' : '\u274c') + '</span>' +
    '</div>';
  }).join('');

  var configuredCount = EV_TOKENS.filter(function (t) {
    var val = (window.__ENV__ && window.__ENV__[t.name]) || window[t.name] || '';
    return val && !val.startsWith('placeholder') && val !== 'your-anon-key-here' && val !== '';
  }).length;

  // System controls
  var controlsHtml = EVE_CONTROLS.map(function (c) {
    return '<button class="eve-ctrl-btn" onclick="switchView(\'' + c.tab + '\')">' +
      '<span class="eve-ctrl-icon">' + c.icon + '</span>' +
      '<span class="eve-ctrl-label">' + c.label + '</span>' +
      '<span class="eve-ctrl-desc">' + c.desc + '</span>' +
    '</button>';
  }).join('');

  el.innerHTML =
    '<div class="panel eve-control-section">' +
      '<h3>\ud83d\udd11 Token & Credential Inventory \u2014 ' + configuredCount + '/' + EV_TOKENS.length + ' Active</h3>' +
      '<div class="ev-token-grid">' + tokensHtml + '</div>' +
      '<div class="ev-token-note">' +
        (configuredCount < EV_TOKENS.length ?
          '\u26a0\ufe0f ' + (EV_TOKENS.length - configuredCount) + ' tokens missing. Add them in the Secrets tab (screenshot you have). ' +
          'Only STRIPE_PUBLISHABLE_KEY + STRIPE_API_KEY are needed for checkout right now. Others unlock Drive sync, domain management, etc.' :
          '\u2705 All tokens configured. Every system is linked.') +
      '</div>' +
    '</div>' +

    '<div class="panel eve-control-section">' +
      '<h3>\ud83c\udfa9 System Control \u2014 Navigate Any Subsystem</h3>' +
      '<div class="eve-ctrl-grid">' + controlsHtml + '</div>' +
    '</div>' +

    '<div class="panel eve-control-section">' +
      '<h3>\u2699\ufe0f Generate & Sync Commands</h3>' +
      '<div class="eve-gen-grid">' +
        '<button class="eve-gen-btn" onclick="switchView(\'kdp\')">\ud83d\udcda Generate Book\n<span>KDP book from NASA archive</span></button>' +
        '<button class="eve-gen-btn" onclick="exportCalendarIcal()">\ud83d\uddd3\ufe0f Calendar Sync\n<span>Export .ics for Google/Outlook</span></button>' +
        '<button class="eve-gen-btn" onclick="switchView(\'space\')">\ud83c\udf0c Sync Space Visuals\n<span>NASA images, planets, blueprints</span></button>' +
        '<button class="eve-gen-btn" onclick="switchView(\'psi\')">\ud83e\ude99 Sync PSI Market\n<span>Token price, buy links</span></button>' +
        '<button class="eve-gen-btn eve-gen-blocked" onclick="alert(\'AI image/video generation requires integration credits. Your workspace credits reset on Oct 1, 2026. Upgrade your tier to unlock now.\')">\ud83d\udcf7 Generate Image\n<span>\u26d4 Credits exhausted</span></button>' +
        '<button class="eve-gen-btn eve-gen-blocked" onclick="alert(\'AI video generation requires integration credits. Your workspace credits reset on Oct 1, 2026. Upgrade your tier to unlock now.\')">\ud83c\udfac Generate Video\n<span>\u26d4 Credits exhausted</span></button>' +
      '</div>' +
    '</div>' +

    '<div class="panel eve-control-section">' +
      '<h3>\ud83d\udcdd Content Sync Status</h3>' +
      '<div class="eve-sync-list">' +
        '<div class="eve-sync-item"><span>\ud83d\udcda KDP Books</span><span class="eve-sync-on">Auto-generated from NASA</span></div>' +
        '<div class="eve-sync-item"><span>\ud83c\udf0c Space Visuals</span><span class="eve-sync-on">Live NASA API</span></div>' +
        '<div class="eve-sync-item"><span>\ud83e\ude99 PSI Coin Market</span><span class="eve-sync-on">Live ticker (simulated)</span></div>' +
        '<div class="eve-sync-item"><span>\ud83d\uddd3\ufe0f Calendar Events</span><span class="eve-sync-on">iCal export ready</span></div>' +
        '<div class="eve-sync-item"><span>\ud83d\udcc8 Dashboard Charts</span><span class="eve-sync-on">Live from Supabase</span></div>' +
        '<div class="eve-sync-item"><span>\ud83d\udcb3 Stripe Payments</span><span class="' + (isTokenConfigured('STRIPE_PUBLISHABLE_KEY') ? 'eve-sync-on' : 'eve-sync-off') + '">' + (isTokenConfigured('STRIPE_PUBLISHABLE_KEY') ? 'Ready' : 'Needs Stripe key') + '</span></div>' +
        '<div class="eve-sync-item"><span>\ud83d\udcbe Google Drive</span><span class="' + (isTokenConfigured('GOOGLE_CLIENT_ID') ? 'eve-sync-on' : 'eve-sync-off') + '">' + (isTokenConfigured('GOOGLE_CLIENT_ID') ? 'Ready' : 'Needs Google Client ID') + '</span></div>' +
        '<div class="eve-sync-item"><span>\ud83d\udcf7 AI Images</span><span class="eve-sync-off">Credits exhausted</span></div>' +
        '<div class="eve-sync-item"><span>\ud83c\udfac AI Videos</span><span class="eve-sync-off">Credits exhausted</span></div>' +
      '</div>' +
    '</div>';
}

function isTokenConfigured(name) {
  var val = (window.__ENV__ && window.__ENV__[name]) || window[name] || '';
  return val && !val.startsWith('placeholder') && !val.startsWith('pk_test_placeholder') && val !== 'your-anon-key-here' && val !== '';
}

function exportCalendarIcal() {
  // Generate .ics file from calendar events
  var events = [];
  // Try to get events from the DB if available
  if (typeof DB !== 'undefined' && DB.getEvents && currentUser) {
    DB.getEvents(currentUser.id).then(function (result) {
      if (result.data) {
        buildIcalFile(result.data);
      } else {
        buildIcalFile([]);
      }
    }).catch(function () { buildIcalFile([]); });
  } else {
    buildIcalFile([]);
  }
}

function buildIcalFile(events) {
  var ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QSLC SovereignHQ//EVE HEI//EN\nCALSCALE:GREGORIAN\n';

  events.forEach(function (e) {
    var dt = (e.event_date || '').replace(/-/g, '');
    var time = e.event_time ? ('T' + e.event_time.replace(/:/g, '') + '00') : '';
    ics += 'BEGIN:VEVENT\n';
    ics += 'UID:' + e.id + '@sovereignhq.qslc\n';
    ics += 'DTSTART:' + dt + (time || '') + '\n';
    ics += 'SUMMARY:' + (e.title || 'Event') + '\n';
    if (e.description) ics += 'DESCRIPTION:' + e.description.replace(/\n/g, '\\n') + '\n';
    ics += 'CATEGORIES:' + (e.category || 'general') + '\n';
    ics += 'END:VEVENT\n';
  });

  ics += 'END:VCALENDAR\n';

  // Trigger download
  var blob = new Blob([ics], { type: 'text/calendar' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sovereignhq-calendar.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (events.length === 0) {
    alert('Calendar .ics exported (empty — sign in and add events to populate it). Import this file into Google Calendar or Outlook to sync.');
  } else {
    alert('Calendar .ics exported with ' + events.length + ' events. Import into Google Calendar or Outlook.');
  }
}
