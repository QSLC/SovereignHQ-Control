// Space Enhanced — planet zoom, spaceship blueprints, holographic visuals

var PLANETS = [
  { name: 'Mercury', diameter: '4,879 km', distance: '57.9M km', moons: 0, temp: '167\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #b8b8b8, #5a5a5a, #2a2a2a)' },
  { name: 'Venus', diameter: '12,104 km', distance: '108.2M km', moons: 0, temp: '464\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #f5deb3, #d4a76a, #8b6914)' },
  { name: 'Earth', diameter: '12,742 km', distance: '149.6M km', moons: 1, temp: '15\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #4da6ff, #2d7dd2, #1a4a8a)' },
  { name: 'Mars', diameter: '6,779 km', distance: '227.9M km', moons: 2, temp: '-65\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #ff6b3d, #c1440e, #6b1f00)' },
  { name: 'Jupiter', diameter: '139,820 km', distance: '778.5M km', moons: 95, temp: '-110\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #e8c39e, #c9966a, #8b5a2b)' },
  { name: 'Saturn', diameter: '116,460 km', distance: '1.43B km', moons: 146, temp: '-140\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #f5e6c8, #d4b896, #a0825a)' },
  { name: 'Uranus', diameter: '50,724 km', distance: '2.87B km', moons: 27, temp: '-195\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #b3e0ff, #7ec8e3, #4a9db8)' },
  { name: 'Neptune', diameter: '49,244 km', distance: '4.5B km', moons: 14, temp: '-200\u00b0C', gradient: 'radial-gradient(circle at 35% 35%, #5588ff, #3060cc, #1a3a7a)' }
];

var BLUEPRINTS = [
  {
    name: 'Quantum Shuttle',
    desc: 'Long-range solo vessel with quantum drive',
    svg: '<svg viewBox="0 0 200 120" fill="none" stroke="#64ffda" stroke-width="1.5">' +
      '<path d="M100 15 L130 50 L140 90 L100 100 L60 90 L70 50 Z" fill="rgba(100,255,218,0.05)"/>' +
      '<path d="M70 50 L40 70 L60 80" /><path d="M130 50 L160 70 L140 80" />' +
      '<circle cx="100" cy="55" r="12" fill="rgba(100,255,218,0.15)" />' +
      '<line x1="100" y1="100" x2="100" y2="115" stroke="#a371f7" />' +
      '<line x1="90" y1="100" x2="85" y2="112" stroke="#a371f7" /><line x1="110" y1="100" x2="115" y2="112" stroke="#a371f7" />' +
      '</svg>'
  },
  {
    name: 'Sovereign Cruiser',
    desc: 'Capital ship with mesh networking array',
    svg: '<svg viewBox="0 0 200 120" fill="none" stroke="#64ffda" stroke-width="1.5">' +
      '<ellipse cx="100" cy="60" rx="70" ry="25" fill="rgba(100,255,218,0.05)" />' +
      '<ellipse cx="100" cy="60" rx="40" ry="15" fill="rgba(163,113,247,0.1)" />' +
      '<circle cx="100" cy="60" r="8" fill="rgba(100,255,218,0.2)" />' +
      '<line x1="30" y1="60" x2="10" y2="60" /><line x1="170" y1="60" x2="190" y2="60" />' +
      '<line x1="100" y1="35" x2="100" y2="20" /><line x1="100" y1="85" x2="100" y2="100" />' +
      '</svg>'
  },
  {
    name: 'EVE Probe',
    desc: 'Autonomous survey drone for deep space',
    svg: '<svg viewBox="0 0 200 120" fill="none" stroke="#64ffda" stroke-width="1.5">' +
      '<path d="M100 30 L115 60 L110 85 L90 85 L85 60 Z" fill="rgba(100,255,218,0.05)" />' +
      '<circle cx="100" cy="55" r="6" fill="rgba(163,113,247,0.3)" />' +
      '<line x1="85" y1="60" x2="60" y2="55" /><line x1="115" y1="60" x2="140" y2="55" />' +
      '<line x1="60" y1="55" x2="55" y2="45" /><line x1="140" y1="55" x2="145" y2="45" />' +
      '<line x1="100" y1="85" x2="100" y2="100" stroke="#a371f7" />' +
      '</svg>'
  },
  {
    name: 'Mesh Station',
    desc: 'Orbital relay node with solar arrays',
    svg: '<svg viewBox="0 0 200 120" fill="none" stroke="#64ffda" stroke-width="1.5">' +
      '<rect x="85" y="45" width="30" height="30" rx="4" fill="rgba(100,255,218,0.08)" />' +
      '<rect x="30" y="50" width="40" height="20" rx="2" fill="rgba(100,255,218,0.03)" />' +
      '<rect x="130" y="50" width="40" height="20" rx="2" fill="rgba(100,255,218,0.03)" />' +
      '<line x1="70" y1="60" x2="85" y2="60" /><line x1="115" y1="60" x2="130" y2="60" />' +
      '<line x1="40" y1="50" x2="40" y2="35" /><line x1="50" y1="50" x2="50" y2="35" /><line x1="60" y1="50" x2="60" y2="35" />' +
      '<line x1="140" y1="50" x2="140" y2="35" /><line x1="150" y1="50" x2="150" y2="35" /><line x1="160" y1="50" x2="160" y2="35" />' +
      '<circle cx="100" cy="60" r="5" fill="rgba(163,113,247,0.3)" />' +
      '</svg>'
  }
];

function loadSpaceX() {
  // Planet grid
  var planetEl = document.getElementById('planetGrid');
  if (planetEl) {
    planetEl.innerHTML = PLANETS.map(function (p, i) {
      return '<div class="planet-card" onclick="showPlanetZoom(' + i + ')">' +
        '<div class="planet-visual" style="background:' + p.gradient + '"></div>' +
        '<div class="planet-name">' + p.name + '</div>' +
        '<div class="planet-info">' + p.moons + ' moons \u2022 ' + p.temp + '</div>' +
      '</div>';
    }).join('');
  }

  // Blueprint grid
  var bpEl = document.getElementById('blueprintGrid');
  if (bpEl) {
    bpEl.innerHTML = BLUEPRINTS.map(function (b) {
      return '<div class="blueprint-card holo">' +
        '<div class="blueprint-svg">' + b.svg + '</div>' +
        '<div class="blueprint-name">' + b.name + '</div>' +
        '<div class="blueprint-desc">' + b.desc + '</div>' +
      '</div>';
    }).join('');
  }
}

function showPlanetZoom(index) {
  var p = PLANETS[index];
  if (!p) return;

  // Remove existing modal
  var existing = document.getElementById('planetModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'planetModal';
  modal.className = 'planet-modal';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div class="planet-modal-content holo">' +
      '<button class="planet-modal-close" onclick="this.closest(\'.planet-modal\').remove()">\u00d7</button>' +
      '<div class="planet-zoom-visual" style="background:' + p.gradient + '"></div>' +
      '<h2>' + p.name + '</h2>' +
      '<div class="planet-details">' +
        '<div class="pd-row"><span>Diameter</span><span>' + p.diameter + '</span></div>' +
        '<div class="pd-row"><span>Distance from Sun</span><span>' + p.distance + '</span></div>' +
        '<div class="pd-row"><span>Moons</span><span>' + p.moons + '</span></div>' +
        '<div class="pd-row"><span>Avg Temperature</span><span>' + p.temp + '</span></div>' +
      '</div>' +
      '<button class="btn btn-outline btn-block" onclick="searchPlanetOnNasa(\'' + p.name + '\')">View on NASA Archive</button>' +
    '</div>';
  document.body.appendChild(modal);
}

function searchPlanetOnNasa(name) {
  window.open('https://images.nasa.gov/search?q=' + encodeURIComponent(name) + '&media_type=image', '_blank');
}
