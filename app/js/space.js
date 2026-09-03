// Space View — 5D Star Map, ISS Tracker, NASA APOD
// Realistic stellar rendering with spectral colors, diffraction spikes, nebulae

var starCanvas, starCtx, starRA = 0, starDec = 0.3;
var starDragging = false, starLastX = 0, starLastY = 0;
var starAnim = null, starTwinkle = 0;
var issTimer = null, issTrail = [];
var apodLoaded = false;

// Spectral class → RGB string (for rgba())
var SPECTRAL_RGB = {
  O: '155, 176, 255',   // blue
  B: '170, 191, 255',   // blue-white
  A: '210, 222, 255',   // white
  F: '248, 247, 255',   // yellow-white
  G: '255, 244, 210',   // yellow (Sun-like)
  K: '255, 200, 140',   // orange
  M: '255, 160, 100'    // red-orange
};

function starColor(spectral, alpha) {
  var rgb = SPECTRAL_RGB[spectral] || SPECTRAL_RGB.A;
  return 'rgba(' + rgb + ', ' + alpha + ')';
}

function randomSpectral() {
  var r = Math.random();
  if (r < 0.08) return 'B';
  if (r < 0.35) return 'A';
  if (r < 0.55) return 'F';
  if (r < 0.72) return 'G';
  if (r < 0.88) return 'K';
  return 'M';
}

// Bright named stars: [RA°, Dec°, name, magnitude, spectral class]
var NAMED_STARS = [
  [101.3, -16.7, 'Sirius', -1.46, 'A'],
  [279.2, 38.8, 'Vega', 0.03, 'A'],
  [37.9, 89.3, 'Polaris', 1.97, 'F'],
  [88.8, 7.4, 'Betelgeuse', 0.50, 'M'],
  [78.6, -8.2, 'Rigel', 0.18, 'B'],
  [213.9, 19.2, 'Arcturus', -0.05, 'K'],
  [201.3, -11.2, '\u03b1 Centauri', -0.27, 'G'],
  [281.2, -33.4, 'Altair', 0.77, 'A'],
  [310.4, 12.5, 'Deneb', 1.25, 'A'],
  [79.2, 45.3, 'Capella', 0.08, 'G'],
  [116.3, 28.0, 'Procyon', 0.34, 'F'],
  [165.5, 56.5, 'Aldebaran', 0.85, 'K'],
  [237.7, -26.4, 'Antares', 1.09, 'M'],
  [254.0, 16.1, 'Spica', 0.98, 'B'],
  [198.0, 8.9, 'Regulus', 1.35, 'B'],
  [344.1, -29.6, 'Fomalhaut', 1.16, 'A'],
  [146.0, 23.4, 'Pollux', 1.14, 'K'],
  [152.1, 12.0, 'Castor', 1.58, 'A']
];

// Nebula clouds on the celestial sphere
var NEBULAE = [
  { ra: 84, dec: -5, rgb: '120, 60, 180', size: 0.28 },   // Orion
  { ra: 290, dec: 40, rgb: '60, 100, 200', size: 0.22 },  // Cygnus
  { ra: 140, dec: 55, rgb: '200, 80, 80', size: 0.18 },   // Cassiopeia
  { ra: 260, dec: -25, rgb: '160, 70, 90', size: 0.2 },    // Scorpius
  { ra: 95, dec: -55, rgb: '80, 120, 200', size: 0.15 }   // Carina
];

// Background stars on celestial sphere
var BG_STARS = [];
(function () {
  // Random sphere distribution
  for (var i = 0; i < 400; i++) {
    var u = Math.random(), v = Math.random();
    var theta = u * 2 * Math.PI;
    var phi = Math.acos(2 * v - 1);
    BG_STARS.push({
      ra: theta * 180 / Math.PI,
      dec: (phi - Math.PI / 2) * 180 / Math.PI,
      size: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      spectral: randomSpectral()
    });
  }
  // Milky Way band — dense star concentration along galactic plane
  for (var i = 0; i < 400; i++) {
    var t = Math.random();
    var ra = t * 360;
    var dec = Math.sin(t * Math.PI * 4) * 22 + (Math.random() - 0.5) * 15;
    BG_STARS.push({
      ra: ra,
      dec: dec,
      size: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      spectral: randomSpectral()
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

  // Deep space background
  starCtx.fillStyle = '#02030a';
  starCtx.fillRect(0, 0, w, h);

  // Nebula clouds (drawn first, behind stars)
  for (var i = 0; i < NEBULAE.length; i++) {
    var n = NEBULAE[i];
    var p = rotate3d(radToCart(n.ra, n.dec), starRA, starDec);
    if (p.z < 0.05) continue;
    var px = cx + p.x * scale;
    var py = cy - p.y * scale;
    var fade = Math.min(1, p.z * 2);
    var radius = n.size * scale * fade;

    var g = starCtx.createRadialGradient(px, py, 0, px, py, radius);
    g.addColorStop(0, 'rgba(' + n.rgb + ', ' + (0.18 * fade) + ')');
    g.addColorStop(0.4, 'rgba(' + n.rgb + ', ' + (0.06 * fade) + ')');
    g.addColorStop(1, 'rgba(' + n.rgb + ', 0)');
    starCtx.fillStyle = g;
    starCtx.beginPath();
    starCtx.arc(px, py, radius, 0, Math.PI * 2);
    starCtx.fill();
  }

  starTwinkle += 0.02;

  // Background stars with spectral colors
  for (var i = 0; i < BG_STARS.length; i++) {
    var s = BG_STARS[i];
    var p = rotate3d(radToCart(s.ra, s.dec), starRA, starDec);
    if (p.z < 0.05) continue;

    var px = cx + p.x * scale;
    var py = cy - p.y * scale;
    var fade = Math.min(1, p.z * 2);
    var tw = 0.4 + 0.6 * Math.sin(starTwinkle + s.phase);
    var alpha = tw * fade * 0.85;

    starCtx.fillStyle = starColor(s.spectral, alpha);
    starCtx.beginPath();
    starCtx.arc(px, py, s.size * fade, 0, Math.PI * 2);
    starCtx.fill();
  }

  // Named stars — rendered with glow, color, and diffraction spikes
  for (var i = 0; i < NAMED_STARS.length; i++) {
    var ns = NAMED_STARS[i];
    var p = rotate3d(radToCart(ns[0], ns[1]), starRA, starDec);
    if (p.z < 0.05) continue;

    var px = cx + p.x * scale;
    var py = cy - p.y * scale;
    var fade = Math.min(1, p.z * 2);
    var mag = ns[3];
    var spectral = ns[4];
    var size = Math.max(1.5, (3 - mag) * 0.8) * fade;
    var tw = 0.7 + 0.3 * Math.sin(starTwinkle * 1.5 + i);

    // Diffraction spikes for bright stars (mag < 1.5)
    if (mag < 1.5 && fade > 0.3) {
      var spikeLen = size * 7 * fade;
      var spikeAlpha = tw * fade * 0.35;
      starCtx.strokeStyle = starColor(spectral, spikeAlpha);
      starCtx.lineWidth = 1;
      starCtx.beginPath();
      starCtx.moveTo(px - spikeLen, py); starCtx.lineTo(px + spikeLen, py);
      starCtx.moveTo(px, py - spikeLen); starCtx.lineTo(px, py + spikeLen);
      starCtx.stroke();
    }

    // Outer glow — colored by spectral class
    var glow = starCtx.createRadialGradient(px, py, 0, px, py, size * 4);
    glow.addColorStop(0, starColor(spectral, tw * 0.6 * fade));
    glow.addColorStop(0.4, starColor(spectral, tw * 0.15 * fade));
    glow.addColorStop(1, starColor(spectral, 0));
    starCtx.fillStyle = glow;
    starCtx.beginPath();
    starCtx.arc(px, py, size * 4, 0, Math.PI * 2);
    starCtx.fill();

    // Core — white-hot center with spectral tint
    starCtx.fillStyle = starColor(spectral, tw * fade);
    starCtx.beginPath();
    starCtx.arc(px, py, size, 0, Math.PI * 2);
    starCtx.fill();

    // Bright white center
    starCtx.fillStyle = 'rgba(255, 255, 255, ' + (tw * fade * 0.8) + ')';
    starCtx.beginPath();
    starCtx.arc(px, py, size * 0.4, 0, Math.PI * 2);
    starCtx.fill();

    // Label
    if (fade > 0.5) {
      starCtx.fillStyle = 'rgba(136, 146, 176, ' + (fade * 0.7) + ')';
      starCtx.font = '10px -apple-system, sans-serif';
      starCtx.fillText(ns[2], px + size + 4, py - size - 2);
    }
  }

  // Auto-rotate when not dragging
  if (!starDragging) starRA += 0.0006;

  starAnim = requestAnimationFrame(drawStarMap);
}

function initStarMap() {
  starCanvas = document.getElementById('starMapCanvas');
  if (!starCanvas) return;
  starCtx = starCanvas.getContext('2d');
  resizeStarCanvas();

  starCanvas.onmousedown = function (e) { starDragging = true; starLastX = e.clientX; starLastY = e.clientY; };
  window.onmousemove = function (e) {
    if (!starDragging) return;
    starRA += (e.clientX - starLastX) * 0.005;
    starDec = Math.max(-1.4, Math.min(1.4, starDec + (e.clientY - starLastY) * 0.005));
    starLastX = e.clientX; starLastY = e.clientY;
  };
  window.onmouseup = function () { starDragging = false; };

  starCanvas.ontouchstart = function (e) {
    starDragging = true; starLastX = e.touches[0].clientX; starLastY = e.touches[0].clientY;
    e.preventDefault();
  };
  starCanvas.ontouchmove = function (e) {
    if (!starDragging) return;
    starRA += (e.touches[0].clientX - starLastX) * 0.005;
    starDec = Math.max(-1.4, Math.min(1.4, starDec + (e.touches[0].clientY - starLastY) * 0.005));
    starLastX = e.touches[0].clientX; starLastY = e.touches[0].clientY;
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

    // If Google Drive is connected, auto-sync
    if (typeof gdriveConnected !== 'undefined' && gdriveConnected) {
      if (typeof syncCurrentApod === 'function') syncCurrentApod();
    }
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

  // Init Google Drive UI
  if (typeof updateGdriveUI === 'function') updateGdriveUI();
}

function stopSpaceDashboard() {
  if (issTimer) { clearInterval(issTimer); issTimer = null; }
  if (starAnim) { cancelAnimationFrame(starAnim); starAnim = null; }
}
