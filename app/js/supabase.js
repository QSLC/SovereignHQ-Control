// Supabase Client Init
// In production, these come from environment variables in Cloudflare Pages
// For local dev, replace with your actual values from supabase.com

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || 'your-anon-key';

let supabase;

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} catch (e) {
  console.error('Supabase init failed:', e);
  supabase = null;
}

// Helper: format cents to dollars
function formatMoney(cents) {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  };
}

// DB Queries
const DB = {
  // Products
  async getProducts(search) {
    let query = supabase.from('products').select('*').eq('is_published', true).order('sort_order', { ascending: true });
    if (search) query = query.ilike('title', `%${search}%`);
    return query;
  },
  async getAllProducts() {
    return supabase.from('products').select('*').order('created_at', { ascending: false });
  },
  async createProduct(data) {
    return supabase.from('products').insert(data);
  },
  async updateProduct(id, data) {
    return supabase.from('products').update(data).eq('id', id);
  },
  async deleteProduct(id) {
    return supabase.from('products').delete().eq('id', id);
  },

  // Purchases
  async getPurchases(userId) {
    return supabase.from('purchases').select('*, products(*)').eq('user_id', userId).order('created_at', { ascending: false });
  },
  async createPurchase(data) {
    return supabase.from('purchases').insert(data);
  },
  async getSalesSummary() {
    return supabase.from('purchases').select('amount_cents, status');
  },

  // Calendar
  async getEvents(userId) {
    return supabase.from('calendar_events').select('*').eq('user_id', userId).order('event_date', { ascending: true });
  },
  async createEvent(data) {
    return supabase.from('calendar_events').insert(data);
  },
  async updateEventStatus(id, status) {
    return supabase.from('calendar_events').update({ status }).eq('id', id);
  },

  // Time Logs
  async getTimeLogs(userId) {
    return supabase.from('time_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
  },
  async createTimeLog(data) {
    return supabase.from('time_logs').insert(data);
  },

  // Profile
  async getProfile(userId) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  }
};
