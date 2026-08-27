// Authentication — Sign In / Sign Up via Supabase Auth

let isLogin = true;
let currentUser = null;

function initAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const authModal = document.getElementById('authModal');
  const authClose = document.getElementById('authClose');
  const authForm = document.getElementById('authForm');
  const authToggle = document.getElementById('authToggle');
  const logoutBtn = document.getElementById('logoutBtn');
  const userBtn = document.getElementById('userBtn');
  const userDropdown = document.getElementById('userDropdown');

  loginBtn.addEventListener('click', () => { isLogin = true; updateAuthUI(); authModal.classList.remove('hidden'); });
  authClose.addEventListener('click', () => authModal.classList.add('hidden'));
  authToggle.addEventListener('click', () => { isLogin = !isLogin; updateAuthUI(); });
  authForm.addEventListener('submit', handleAuth);
  logoutBtn.addEventListener('click', handleLogout);
  userBtn.addEventListener('click', () => userDropdown.classList.toggle('hidden'));

  // Check existing session
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) handleAuthState(data.session.user);
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) handleAuthState(session.user);
    if (event === 'SIGNED_OUT') handleSignOut();
  });
}

function updateAuthUI() {
  const title = document.getElementById('authTitle');
  const submit = document.getElementById('authSubmit');
  const toggle = document.getElementById('authToggle');
  const nameField = document.getElementById('authName');

  if (isLogin) {
    title.textContent = 'Sign In';
    submit.textContent = 'Sign In';
    toggle.textContent = "Don't have an account? Sign up";
    nameField.classList.add('hidden');
  } else {
    title.textContent = 'Sign Up';
    submit.textContent = 'Sign Up';
    toggle.textContent = 'Already have an account? Sign in';
    nameField.classList.remove('hidden');
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName').value;
  const errorEl = document.getElementById('authError');

  try {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) throw error;
      alert('Check your email for a confirmation link!');
    }
    document.getElementById('authModal').classList.add('hidden');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
}

async function handleAuthState(user) {
  currentUser = user;
  document.getElementById('loginBtn').classList.add('hidden');
  document.getElementById('userMenu').classList.remove('hidden');
  document.getElementById('userInfo').innerHTML = `<div style="padding:8px;font-size:14px">${user.email}</div>`;

  // Check if admin
  try {
    const { data: profile } = await DB.getProfile(user.id);
    if (profile?.role === 'admin') {
      document.getElementById('adminTab').style.display = '';
    }
  } catch (e) { console.error('Profile fetch error:', e); }

  // Refresh all views
  loadDashboard();
  loadStore();
  loadCalendar();
  loadTimeLog();
}

function handleLogout() {
  supabase.auth.signOut();
}

function handleSignOut() {
  currentUser = null;
  document.getElementById('loginBtn').classList.remove('hidden');
  document.getElementById('userMenu').classList.add('hidden');
  document.getElementById('adminTab').style.display = 'none';
  document.getElementById('userDropdown').classList.add('hidden');
}
