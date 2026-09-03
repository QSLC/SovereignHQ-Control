// Google Drive Sync — OAuth + file listing + APOD/star map upload

var gdriveToken = null;
var gdriveConnected = false;

function getGdriveClientId() {
  var env = window.__ENV__ || {};
  return env.GOOGLE_CLIENT_ID || window.GOOGLE_CLIENT_ID || '';
}

function updateGdriveUI() {
  var statusEl = document.getElementById('gdriveStatus');
  var galleryEl = document.getElementById('gdriveGallery');
  if (!statusEl) return;

  var clientId = getGdriveClientId();

  if (!clientId) {
    statusEl.innerHTML =
      '<div class="gdrive-info">' +
      '<strong>Google Drive not configured.</strong><br>' +
      'Add your Google OAuth Client ID to <code>config.js</code> as <code>GOOGLE_CLIENT_ID</code> to enable sync.<br>' +
      '<a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="apod-link">Get Client ID \u2192</a>' +
      '</div>';
    if (galleryEl) galleryEl.innerHTML = '';
    return;
  }

  if (!gdriveConnected) {
    statusEl.innerHTML = '<button class="btn btn-primary btn-sm" onclick="connectGoogleDrive()">Connect Google Drive</button>';
    if (galleryEl) galleryEl.innerHTML = '';
    return;
  }

  statusEl.innerHTML =
    '<span class="gdrive-connected">\u2713 Connected</span> ' +
    '<button class="btn btn-sm" onclick="syncCurrentApod()">Sync APOD</button> ' +
    '<button class="btn btn-sm" onclick="saveStarMapToDrive()">Save Star Map</button> ' +
    '<button class="btn btn-sm" onclick="disconnectGoogleDrive()">Disconnect</button>';
}

function connectGoogleDrive() {
  var clientId = getGdriveClientId();
  if (!clientId) return;

  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    alert('Google Identity Services not loaded yet. Please wait a moment and try again.');
    return;
  }

  google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: function (response) {
      if (response.error) {
        console.error('Google OAuth error:', response.error);
        alert('Google connection failed: ' + response.error);
        return;
      }
      gdriveToken = response.access_token;
      gdriveConnected = true;
      updateGdriveUI();
      listDriveImages();
      syncCurrentApod();
    }
  }).requestAccessToken();
}

function disconnectGoogleDrive() {
  if (gdriveToken && typeof google !== 'undefined' && google.accounts) {
    google.accounts.oauth2.revoke(gdriveToken, function () {
      gdriveToken = null;
      gdriveConnected = false;
      updateGdriveUI();
    });
  } else {
    gdriveToken = null;
    gdriveConnected = false;
    updateGdriveUI();
  }
}

async function listDriveImages() {
  if (!gdriveToken) return;
  var galleryEl = document.getElementById('gdriveGallery');
  if (!galleryEl) return;

  galleryEl.innerHTML = '<div class="gdrive-info">Loading synced images...</div>';

  try {
    var resp = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent("mimeType contains 'image' and trashed=false") +
      "&pageSize=12&orderBy=modifiedTime desc&fields=files(id,name,thumbnailLink,webViewLink)",
      { headers: { Authorization: 'Bearer ' + gdriveToken } }
    );
    var data = await resp.json();

    if (data.files && data.files.length > 0) {
      galleryEl.innerHTML = data.files.map(function (f) {
        return '<div class="gdrive-thumb">' +
          (f.thumbnailLink
            ? '<img src="' + f.thumbnailLink + '" alt="' + f.name + '">'
            : '<div class="gdrive-thumb-placeholder">\ud83d\uddbc\ufe0f</div>') +
          '<div class="gdrive-thumb-name">' + f.name + '</div>' +
          '</div>';
      }).join('');
    } else {
      galleryEl.innerHTML = '<div class="gdrive-info">No images found. Click "Sync APOD" to upload NASA visuals.</div>';
    }
  } catch (e) {
    galleryEl.innerHTML = '<div class="gdrive-info">Error listing files: ' + e.message + '</div>';
  }
}

async function uploadBlobToDrive(blob, filename, mimeType) {
  if (!gdriveToken) return false;
  var boundary = '-------sovereignhq' + Date.now();
  var metadata = { name: filename, mimeType: mimeType };

  var body =
    '--' + boundary + '\r\n' +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Type: ' + mimeType + '\r\n\r\n';

  var bodyEnd = '\r\n--' + boundary + '--';

  var bodyBytes = new TextEncoder().encode(body);
  var blobBytes = new Uint8Array(await blob.arrayBuffer());
  var endBytes = new TextEncoder().encode(bodyEnd);

  var combined = new Uint8Array(bodyBytes.length + blobBytes.length + endBytes.length);
  combined.set(bodyBytes, 0);
  combined.set(blobBytes, bodyBytes.length);
  combined.set(endBytes, bodyBytes.length + blobBytes.length);

  var resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + gdriveToken,
      'Content-Type': 'multipart/related; boundary="' + boundary + '"'
    },
    body: combined
  });

  return resp.ok;
}

async function syncCurrentApod() {
  if (!gdriveToken) return;
  var apodImg = document.querySelector('.apod-image');
  if (!apodImg) return;

  var statusEl = document.getElementById('gdriveStatus');
  var origHtml = statusEl.innerHTML;
  statusEl.innerHTML = '<span class="gdrive-info">Syncing APOD...</span>';

  try {
    var resp = await fetch(apodImg.src);
    var blob = await resp.blob();
    var title = document.querySelector('.apod-title')?.textContent || 'nasa-apod';
    var date = document.querySelector('.apod-date')?.textContent || new Date().toISOString().split('T')[0];
    var filename = 'NASA_' + date + '_' + title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';

    var ok = await uploadBlobToDrive(blob, filename, 'image/jpeg');
    if (ok) {
      listDriveImages();
    } else {
      statusEl.innerHTML = '<div class="gdrive-info">Upload failed. Check console.</div>' + origHtml;
    }
  } catch (e) {
    statusEl.innerHTML = '<div class="gdrive-info">Sync error (CORS may block image fetch): ' + e.message + '</div>' + origHtml;
  }
}

async function saveStarMapToDrive() {
  if (!gdriveToken) return;
  var canvas = document.getElementById('starMapCanvas');
  if (!canvas) return;

  var statusEl = document.getElementById('gdriveStatus');
  statusEl.innerHTML = '<span class="gdrive-info">Saving star map...</span>';

  try {
    var blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/png');
    });
    var filename = 'StarMap_' + new Date().toISOString().split('T')[0] + '.png';
    var ok = await uploadBlobToDrive(blob, filename, 'image/png');
    if (ok) {
      listDriveImages();
    }
  } catch (e) {
    statusEl.innerHTML = '<div class="gdrive-info">Save error: ' + e.message + '</div>';
  }
}
