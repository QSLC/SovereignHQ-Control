// App Router & Init

document.addEventListener('DOMContentLoaded', () => {
  // Inject environment (in production, Cloudflare Pages injects these)
  window.__ENV__ = {
    SUPABASE_URL: window.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || '',
    STRIPE_PUBLISHABLE_KEY: window.STRIPE_PUBLISHABLE_KEY || ''
  };

  // Nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Modals
  setupModals();

  // Forms
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
  document.getElementById('timeForm').addEventListener('submit', handleTimeSubmit);

  // Search
  document.getElementById('storeSearch').addEventListener('input', (e) => {
    const filtered = allProducts.filter(p => 
      p.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    renderProducts(filtered);
  });

  // Init auth
  initAuth();

  // Load views (store loads for everyone, others need auth)
  loadStore();

  // Restore theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

function switchView(view) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.nav-tab[data-view="${view}"]`).classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');

  if (view === 'dashboard') loadDashboard();
  if (view === 'store') loadStore();
  if (view === 'calendar') loadCalendar();
  if (view === 'timelog') loadTimeLog();
  if (view === 'system') loadSystemDashboard();
  if (view === 'admin') loadAdminProducts();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

function setupModals() {
  // Event modal
  document.getElementById('addEventBtn').addEventListener('click', () => {
    document.getElementById('eventModal').classList.remove('hidden');
    document.getElementById('eventDate').valueAsDate = new Date();
  });
  document.getElementById('eventClose').addEventListener('click', () => {
    document.getElementById('eventModal').classList.add('hidden');
  });

  // Time modal
  document.getElementById('addTimeBtn').addEventListener('click', () => {
    document.getElementById('timeModal').classList.remove('hidden');
    document.getElementById('timeDate').valueAsDate = new Date();
  });
  document.getElementById('timeClose').addEventListener('click', () => {
    document.getElementById('timeModal').classList.add('hidden');
  });
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(e => console.log('SW registration failed:', e));
}
