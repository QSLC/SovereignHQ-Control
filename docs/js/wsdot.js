// WSDOT Highway Cameras — Live traffic camera feed with GPS
// Requires a free WSDOT Traveler API access code from https://wsdot.wa.gov/traffic/api/

const WSDOT_ACCESS_CODE = window.__ENV__?.WSDOT_ACCESS_CODE || '';
const WSDOT_API_URL = 'https://apps.wsdot.wa.gov/traffic/api/HighwayCameras/HighwayCamerasREST.svc/GetCamerasAsJson';

let userLocation = null;

// Get user's GPS location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        resolve(userLocation);
      },
      (err) => reject(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Calculate distance between two coordinates (miles)
function distance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fetch all WSDOT cameras
async function fetchCameras() {
  if (!WSDOT_ACCESS_CODE || WSDOT_ACCESS_CODE === 'PLACEHOLDER_WSDOT_CODE') {
    throw new Error('WSDOT access code not configured. Get a free code at https://wsdot.wa.gov/traffic/api/');
  }

  const url = `${WSDOT_API_URL}?AccessCode=${encodeURIComponent(WSDOT_ACCESS_CODE)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`WSDOT API error: ${resp.status}`);
  return resp.json();
}

// Sort cameras by distance from user
function sortCamerasByDistance(cameras) {
  if (!userLocation) return cameras;
  return cameras.map(c => ({
    ...c,
    distance: c.Latitude && c.Longitude
      ? distance(userLocation.lat, userLocation.lon, c.Latitude, c.Longitude)
      : 999
  })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
}

// Render camera grid
function renderCameras(cameras, container) {
  if (!container) return;
  
  if (cameras.length === 0) {
    container.innerHTML = '<p class="wsdot-empty">No cameras available.</p>';
    return;
  }

  const html = cameras.slice(0, 24).map(cam => {
    const distText = cam.distance ? ` · ${cam.distance.toFixed(1)} mi away` : '';
    return `
      <div class="camera-card">
        <div class="camera-image">
          <img src="${cam.ImageUrl}" alt="${cam.Title || 'Camera'}" loading="lazy"
               onerror="this.parentElement.innerHTML='<span class=\\'camera-error\\'>Image unavailable</span>'" />
        </div>
        <div class="camera-meta">
          <h4>${cam.Title || 'Camera ' + cam.Id}</h4>
          <p>${cam.RoadName || 'Unknown road'} · ${cam.Direction || ''}${distText}</p>
          ${cam.Latitude && cam.Longitude ? 
            `<p class="camera-coords">${cam.Latitude.toFixed(4)}, ${cam.Longitude.toFixed(4)}</p>` : ''}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="wsdot-header">
      <span class="wsdot-count">${cameras.length} cameras found</span>
      ${userLocation ? `<span class="wsdot-loc">Near ${userLocation.lat.toFixed(3)}, ${userLocation.lon.toFixed(3)}</span>` : ''}
    </div>
    <div class="cameras-grid">${html}</div>`;
}

// Initialize WSDOT camera panel
async function initWsdotCameras() {
  const container = document.getElementById('wsdot-cameras');
  if (!container) return;

  container.innerHTML = '<p class="wsdot-loading">Loading highway cameras...</p>';

  try {
    // Try to get user location (non-blocking — works without it too)
    try {
      await getUserLocation();
    } catch (e) {
      console.log('Location unavailable, showing all cameras:', e);
    }

    const cameras = await fetchCameras();
    const sorted = sortCamerasByDistance(cameras);
    renderCameras(sorted, container);
  } catch (err) {
    container.innerHTML = `
      <div class="wsdot-error">
        <p><strong>Camera feed unavailable</strong></p>
        <p>${err.message}</p>
        <p>Get a free WSDOT API access code at wsdot.wa.gov/traffic/api/ and add it to config.js as WSDOT_ACCESS_CODE.</p>
      </div>`;
  }
}

// Auto-refresh every 5 minutes
let wsdotRefreshInterval;
function startWsdotRefresh() {
  if (wsdotRefreshInterval) clearInterval(wsdotRefreshInterval);
  wsdotRefreshInterval = setInterval(() => {
    initWsdotCameras();
  }, 300000);
}

// Initialize on page load if the section exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('wsdot-cameras')) {
    initWsdotCameras();
    startWsdotRefresh();
  }
});
