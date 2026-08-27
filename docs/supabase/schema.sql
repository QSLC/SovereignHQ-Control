-- QSLC SovereignHQ Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PRODUCTS (books, PDFs, templates)
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'book' CHECK (category IN ('book', 'pdf', 'template', 'service')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  cover_image_url TEXT,
  file_url TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASES
-- ============================================
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  stripe_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDAR / ACTIONS
-- ============================================
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'uspto', 'paychex', 'banking', 'cloudflare', 'github', 'client', 'deadline')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TIME LOGS (billing)
-- ============================================
CREATE TABLE time_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  task TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  rate_cents INTEGER DEFAULT 7500,
  notes TEXT,
  pay_calculated_cents INTEGER GENERATED ALWAYS AS (hours * rate_cents) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES DASHBOARD VIEW
-- ============================================
CREATE OR REPLACE VIEW sales_summary AS
SELECT
  COUNT(*) as total_sales,
  COALESCE(SUM(amount_cents), 0) as total_revenue_cents,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM purchases;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: everyone can see published, admin can see all
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON products
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Purchases: users can see their own
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Calendar: users can manage their own
CREATE POLICY "Users can manage own calendar" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Time logs: users can manage their own
CREATE POLICY "Users can manage own time logs" ON time_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_published ON products(is_published, sort_order);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_calendar_user_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_time_logs_user_date ON time_logs(user_id, date);
