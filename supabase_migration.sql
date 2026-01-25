-- ==========================================
-- 1. EXTENSIONS & SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 2. USER PROFILES
-- ==========================================
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'club_owner', 'customer')),
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT, -- Specifically for Court Owners
  is_verified BOOLEAN DEFAULT false, -- For Admin approval of owners
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. CLUBS (BADMINTON CENTERS)
-- ==========================================
CREATE TABLE public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}', -- e.g., ['AC', 'Parking', 'Canteen', 'WiFi', 'Shower']
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Club Operating Hours (Weekly Schedule)
CREATE TABLE public.club_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false, -- For marking days like holidays
  UNIQUE(club_id, day_of_week)
);

-- ==========================================
-- 4. COURTS
-- ==========================================
CREATE TABLE public.courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Court 1", "VIP 1"
  description TEXT,
  images TEXT[] DEFAULT '{}',
  price_per_hour DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. BOOKINGS
-- ==========================================
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL, -- Cached for filtering
  customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL, -- Platform's cut at time of booking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed', 'cancelled', 'completed')),
  payment_method TEXT DEFAULT 'stripe',
  stripe_session_id TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Hard prevention of double booking for same court/time
  CONSTRAINT no_overlapping_bookings UNIQUE (court_id, booking_date, start_time)
);

-- ==========================================
-- 6. REVIEWS & FAVORITES
-- ==========================================
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, club_id)
);

-- ==========================================
-- 7. NOTIFICATIONS
-- ==========================================
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('booking', 'reminder', 'update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. FINANCIALS (OWNER PAYOUTS)
-- ==========================================
CREATE TABLE public.payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 9. PLATFORM SETTINGS
-- ==========================================
CREATE TABLE public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- e.g., 10%
  refund_threshold_hours INTEGER DEFAULT 24,
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 10. TRIGGERS & FUNCTIONS
-- ==========================================

-- Auto-update updated_at logic
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_clubs BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_courts BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-calculate rating on review insert
CREATE OR REPLACE FUNCTION public.update_club_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clubs
  SET rating = (SELECT AVG(rating) FROM public.reviews WHERE club_id = NEW.club_id)
  WHERE id = NEW.club_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_club_rating();

-- ==========================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profile view" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Self update profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Clubs/Courts
CREATE POLICY "Public club view" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Owner/Admin manage clubs" ON public.clubs FOR ALL USING (owner_id = auth.uid() OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public court view" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Owner/Admin manage courts" ON public.courts FOR ALL USING (EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND owner_id = auth.uid()) OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Bookings
CREATE POLICY "Customer view own" ON public.bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Owner view related" ON public.bookings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Admin view all" ON public.bookings FOR SELECT USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Customer book" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Notifications
CREATE POLICY "User view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User delete own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- 12. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_clubs_name ON public.clubs USING gin (name gin_trgm_ops); -- Requires pg_trgm extension
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- ==========================================
-- 13. ADMIN STATS VIEW
-- ==========================================
CREATE OR REPLACE VIEW public.vw_admin_dashboard AS
SELECT 
  (SELECT count(*) FROM public.user_profiles WHERE role = 'customer') as total_customers,
  (SELECT count(*) FROM public.user_profiles WHERE role = 'club_owner') as total_owners,
  (SELECT count(*) FROM public.clubs WHERE is_active = true) as total_active_clubs,
  (SELECT count(*) FROM public.bookings WHERE status = 'paid') as total_confirm_bookings,
  (SELECT sum(total_price) FROM public.bookings WHERE status = 'paid') as gross_revenue,
  (SELECT sum(commission_amount) FROM public.bookings WHERE status = 'paid') as platform_net_revenue;
