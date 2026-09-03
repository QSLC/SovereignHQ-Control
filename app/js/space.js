// Space View — 5D Star Map, ISS Tracker, NASA APOD

var starCanvas, starCtx, starRA = 0, starDec = 0.3;
var starDragging = false, starLastX = 0, starLastY = 0;
var starAnim = null, starTwinkle = 0;
var issTimer = null, issTrail = [];
var apodLoaded = false;

// Bright named stars: [RA°, Dec°, name, magnitude]
var NAMED_STARS = [
  [101.3, -16.7, 'Sirius', -1.46],
  [279.2, 38.8, 'Vega', 0.03],
  [37.9, 89.3, 'Polaris', 1.97],
  [88.8, 7.4, 'Betelgeuse', 0.50],
  [78.6, -8.2, 'Rigel', 0.18],
  [213.9, 19.2, 'Arcturus', -0.05],
  [201.3, -11.2, 'α Centauri', -0.27],
  [281.2, -33.4, 'Altair', 0.77],
  [310.4, 12.5, 'Deneb', 1.25],
  [79.2, 45.3, 'Capella', 0.08],
  [116.3, 28.0, 'Procyon', 0.34],
  [165.5, 56.5, 'Aldebaran', 0.85],
  [237.7, -26.4, 'Antares', 1.09],
  [254.0, 16.1, 'Spica', 0.98],
  [198.0, 8.9, 'Regulus', 1.35],
  [344.1, -29.6, 'Fomalhaut', 1.16],
  [146.0, 23.4, 'Pollux', 1.14],
  [152.1, 12.0, 'Castor', 1.58]
];

// Background stars on celestial sphere
var BG_STARS = [];
(function () {
  for (var i = 0; i < 500; i++) {
    var u = Math.random(), v = Math.random();
    var theta = u * 2 * Math.PI;
    var phi = Math.acos(2 * v - 1);
    BG_STARS.push({
      ra: theta * 180 / Math.PI,
      dec: (phi - Math.PI / 2) * 180 / Math.PI,
      size: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      tint: Math.random() < 0.15 ? 'blue' : (Math.random() < 0.3 ? 'warm' : 'white')
    });
  }
})();

function radToCart(raDeg, decDeg) {
  var ra = raDeg * Math.PI / 180;
  var dec = decDeg * Math.PI / 180;
  return { x: Math.cos(dec) * Math.cos(ra), y: Math.sin(dec), z: Math.cos(dec) * Math.sin(ra) };
}

function rotate3d(p, ry, rx) {
  var cy = Math.cos(ry), sy = Math.sin(ry);
  var x1 = p.x * cy - p.z * sy;
  var z1 = p.x * sy + p.z * cy;
  var cx = Math.cos(rx), sx = Math.sin(rx);
  return { x: x1, y: p.y * cx - z1 * sx, z: p.y * sx + z1 * cx };
}

function resizeStarCanvas() {
  if (!starCanvas) return;
  var rect = starCanvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  starCanvas.width = rect.width * dpr;
  starCanvas.height = rect.height * dpr;
  starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawStarMap() {
  if (!starCanvas || !document.getElementById('view-space').classList.contains('active')) {
    starAnim = null;
    return;
  }

  var dpr = window.devicePixelRatio || 1;
  var w = starCanvas.width / dpr;
  var h = starCanvas.height / dpr;
  var cx = w / 2, cy = h / 2;
  var scale = Math.min(w, h) * 0.42;

  starCtx.fillStyle = '#02030a';
  starCtx.fillRect(0, 0, w, h);

  // Nebula glow
  var grad = starCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
  grad.addColorStop(0, 'rgba(40, 20, 80, 0.12)');
  grad.addColorStop(0.4, 'rgba(20, 30, 60, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  starCtx.fillStyle = grad;
  starCtx.fillRect(0, 0, w, h);

  starTwinkle += 0.02;

  // Background stars
  for (var i = 0; i < BG_STARS.length; i++) {
    var s = BG_STARS[i];
    var p = rotate3d(radToCart(s.ra, s.dec), starRA, starDec);
    if (p.z < 0.05) continue;

    var px = cx + p.x * scale;
    var py = cy - p.y * scale;
    var fade = Math.min(1, p.z * 2);
    var tw = 0.4 + 0.6 * Math.sin(starTwinkle + s.phase);
    var alpha = tw * fade * 0.8;

    if (s.tint === 'blue') starCtx.fillStyle = 'rgba(180, 200, 255, ' + alpha + ')';
    else if (s.tint === 'warm') starCtx.fillStyle = 'rgba(255, 210, 180, ' + alpha + ')';
    else starCtx.fillStyle = 'rgba(255, 255, 240, ' + alpha + ')';

    starCtx.beginPath();
    starCtx.arc(px, py, s.size * fade, 0, Math.PI * 2);
    starCtx.fill();
  }

  // Named stars
  for (var i = 0; i < NAMED_STARS.length; i++) {
    var ns = NAMED_STARS[i];
    var p = rotate3d(radToCart(ns[0], ns[1]), starRA, starDec);
    if (p.z < 0.05) continue;

    var px = cx + p.x * scale;
    var py = cy - p.y * scale;
    var fade = Math.min(1, p.z * 2);
    var mag = ns[3];
    var size = Math.max(1.5, (3 - mag) * 0.8) * fade;
    var tw = 0.7 + 0.3 * Math.sin(starTwinkle * 1.5 + i);

    // Glow
    var glow = starCtx.createRadialGradient(px, py, 0, px, py, size * 4);
    glow.addColorStop(0, 'rgba(100, 255, 218, ' + (tw * 0.6 * fade) + ')');
    glow.addColorStop(0.4, 'rgba(100, 255, 218, ' + (tw * 0.15 * fade) + ')');
    glow.addColorStop(1, 'rgba(100, 255, 218, 0)');
    starCtx.fillStyle = glow;
    starCtx.beginPath();
    starCtx.arc(px, py, size * 4, 0, Math.PI * 2);
    starCtx.fill();

    // Core
    starCtx.fillStyle = 'rgba(255, 255, 255, ' + (tw * fade) + ')';
    starCtx.beginPath();
    starCtx.arc(px, py, size, 0, Math.PI * 2);
    starCtx.fill();

    // Label
    if (fade > 0.5) {
      starCtx.fillStyle = 'rgba(136, 146, 176, ' + (fade * 0.7) + ')';
      starCtx.font = '10px -apple-system, sans-serif';
      starCtx.fillText(ns[2], px + size + 4, py - size - 2);
    }
  }

  // Auto-rotate when not dragging
  if (!starDragging) starRA += 0.0008;

  starAnim = requestAnimationFrame(drawStarMap);
}

function initStarMap() {
  starCanvas = document.getElementById('starMapCanvas');
  if (!starCanvas) return;
  starCtx = starCanvas.getContext('2d');
  resizeStarCanvas();

  // Mouse
  starCanvas.onmousedown = function (e) { starDragging = true; starLastX = e.clientX; starLastY = e.clientY; };
  window.onmousemove = function (e) {
    if (!starDragging) return;
    starRA += (e.clientX - starLastX) * 0.005;
    starDec = Math.max(-1.4, Math.min(1.4, starDec + (e.clientY - starLastY) * 0.005));
    starLastX = e.clientX; starLastY = e.clientY;
  };
  window.onmouseup = function () { starDragging = false; };

  // Touch
  starCanvas.ontouchstart = function (e) {
    starDragging = true;
    starLastX = e.touches[0].clientX;
    starLastY = e.touches[0].clientY;
    e.preventDefault();
  };
  starCanvas.ontouchmove = function (e) {
    if (!starDragging) return;
    starRA += (e.touches[0].clientX - starLastX) * 0.005;
    starDec = Math.max(-1.4, Math.min(1.4, starDec + (e.touches[0].clientY - starLastY) * 0.005));
    starLastX = e.touches[0].clientX;
    starLastY = e.touches[0].clientY;
    e.preventDefault();
  };
  starCanvas.ontouchend = function () { starDragging = false; };

  if (starAnim) cancelAnimationFrame(starAnim);
  drawStarMap();
}

// --- ISS Tracker ---

async function fetchISS() {
  try {
    var resp = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    var data = await resp.json();

    document.getElementById('issLat').textContent = data.latitude.toFixed(2) + '\u00b0';
    document.getElementById('issLon').textContent = data.longitude.toFixed(2) + '\u00b0';
    document.getElementById('issAlt').textContent = data.altitude.toFixed(1) + ' km';
    document.getElementById('issVel').textContent = Math.round(data.velocity * 3.6).toLocaleString() + ' km/h';
    document.getElementById('issTime').textContent = 'Last update: ' + new Date(data.timestamp * 1000).toLocaleTimeString();

    issTrail.push({ lat: data.latitude, lon: data.longitude });
    if (issTrail.length > 30) issTrail.shift();
    drawISSMap();
  } catch (e) {
    document.getElementById('issTime').textContent = 'Connection error: ' + e.message;
  }
}

function drawISSMap() {
  var canvas = document.getElementById('issMapCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  var w = rect.width, h = rect.height;

  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(100, 255, 218, 0.08)';
  ctx.lineWidth = 1;
  for (var lat = -60; lat <= 60; lat += 30) {
    var y = h / 2 - (lat / 90) * (h / 2 - 10);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (var lon = -150; lon <= 150; lon += 30) {
    var x = w / 2 + (lon / 180) * (w / 2 - 10);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  // Trail
  if (issTrail.length > 1) {
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < issTrail.length; i++) {
      var tx = w / 2 + (issTrail[i].lon / 180) * (w / 2 - 10);
      var ty = h / 2 - (issTrail[i].lat / 90) * (h / 2 - 10);
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // Current position
  if (issTrail.length > 0) {
    var pos = issTrail[issTrail.length - 1];
    var x = w / 2 + (pos.lon / 180) * (w / 2 - 10);
    var y = h / 2 - (pos.lat / 90) * (h / 2 - 10);

    var glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
    glow.addColorStop(0, 'rgba(100, 255, 218, 0.8)');
    glow.addColorStop(1, 'rgba(100, 255, 218, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#64ffda';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// --- NASA APOD ---

async function fetchAPOD() {
  try {
    var resp = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    var data = await resp.json();
    var el = document.getElementById('apodContent');

    if (data.media_type === 'image') {
      el.innerHTML =
        '<img src="' + data.url + '" class="apod-image" alt="' + (data.title || 'APOD') + '">' +
        '<div class="apod-title">' + (data.title || 'Astronomy Picture of the Day') + '</div>' +
        '<div class="apod-date">' + (data.date || '') + '</div>' +
        '<div class="apod-explanation">' + (data.explanation || '').substring(0, 300) + '...</div>' +
        '<a href="' + (data.hdurl || data.url) + '" target="_blank" class="apod-link">View full image \u2192</a>';
    } else if (data.media_type === 'video') {
      el.innerHTML =
        '<iframe src="' + data.url + '" class="apod-video" frameborder="0" allowfullscreen></iframe>' +
        '<div class="apod-title">' + (data.title || '') + '</div>' +
        '<div class="apod-date">' + (data.date || '') + '</div>' +
        '<div class="apod-explanation">' + (data.explanation || '').substring(0, 300) + '...</div>';
    }
    apodLoaded = true;
  } catch (e) {
    document.getElementById('apodContent').innerHTML =
      '<div class="empty-state">NASA API error: ' + e.message + '</div>';
  }
}

// --- Main entry / cleanup ---

function loadSpaceDashboard() {
  if (issTimer) clearInterval(issTimer);
  if (starAnim) cancelAnimationFrame(starAnim);

  initStarMap();
  fetchISS();
  issTimer = setInterval(fetchISS, 10000);

  if (!apodLoaded) fetchAPOD();
}

function stopSpaceDashboard() {
  if (issTimer) { clearInterval(issTimer); issTimer = null; }
  if (starAnim) { cancelAnimationFrame(starAnim); starAnim = null; }
}
