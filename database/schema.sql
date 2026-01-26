-- ==========================================
-- BADMINTON BOOKING SYSTEM - UNIFIED DATABASE SCHEMA
-- ==========================================
-- PostgreSQL Database Schema with Supabase Integration
-- This file consolidates all tables and functionality for the badminton booking web app

-- ==========================================
-- 1. EXTENSIONS & SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 2. ENUM TYPES FOR DATA CONSISTENCY
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'club_owner', 'customer');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE court_status AS ENUM ('open', 'closed', 'maintenance');
CREATE TYPE notification_type AS ENUM ('booking', 'reminder', 'update', 'system', 'payment');

-- ==========================================
-- 3. USER PROFILES (INTEGRATED WITH SUPABASE AUTH)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    company_name TEXT, -- Specifically for Club Owners
    is_verified BOOLEAN DEFAULT false, -- For Admin approval of owners
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. CLUBS (BADMINTON CENTERS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS public.club_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false, -- For marking days like holidays
    UNIQUE(club_id, day_of_week)
);

-- ==========================================
-- 5. COURTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.courts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "Court 1", "VIP 1"
    description TEXT,
    images TEXT[] DEFAULT '{}',
    price_per_hour DECIMAL(10,2) NOT NULL,
    status court_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. TIME SLOTS (AVAILABLE BOOKING TIMES)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(court_id, date, start_time)
);

-- ==========================================
-- 7. BOOKINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL, -- Cached for filtering
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL, -- Platform's cut at time of booking
    status booking_status DEFAULT 'pending',
    payment_method TEXT DEFAULT 'stripe',
    stripe_session_id TEXT,
    cancellation_reason TEXT,
    player_count INTEGER NOT NULL DEFAULT 1 CHECK (player_count > 0 AND player_count <= 4),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Hard prevention of double booking for same court/time
    CONSTRAINT no_overlapping_bookings UNIQUE (court_id, booking_date, start_time)
);

-- ==========================================
-- 8. PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. REVIEWS & FAVORITES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_id, booking_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, club_id)
);

-- ==========================================
-- 10. NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 11. FINANCIALS (OWNER PAYOUTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 12. PLATFORM SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- e.g., 10%
    refund_threshold_hours INTEGER DEFAULT 24,
    currency TEXT DEFAULT 'USD',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 13. PERFORMANCE INDEXES
-- ==========================================
-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Club indexes
CREATE INDEX IF NOT EXISTS idx_clubs_owner_id ON public.clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_is_active ON public.clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON public.clubs USING gin (name gin_trgm_ops); -- Requires pg_trgm extension

-- Court indexes
CREATE INDEX IF NOT EXISTS idx_courts_club_id ON public.courts(club_id);
CREATE INDEX IF NOT EXISTS idx_courts_status ON public.courts(status);

-- Time slot indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_court_id ON public.time_slots(court_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON public.time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON public.time_slots(is_available);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON public.bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_club_id ON public.bookings(club_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_club_id ON public.reviews(club_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ==========================================
-- 14. TRIGGERS & FUNCTIONS
-- ==========================================

-- Auto-update updated_at logic
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_clubs BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_courts BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_time_slots BEFORE UPDATE ON public.time_slots FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_reviews BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_notifications BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-calculate club rating on review insert/update
CREATE OR REPLACE FUNCTION public.update_club_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clubs
    SET rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE club_id = NEW.club_id), 0)
    WHERE id = NEW.club_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_club_rating();

-- Function to create time slots automatically
CREATE OR REPLACE FUNCTION public.create_time_slots(
    p_court_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_opening_time TIME,
    p_closing_time TIME,
    p_slot_duration_minutes INTEGER DEFAULT 60
)
RETURNS VOID AS $$
DECLARE
    current_date DATE := p_start_date;
    current_time TIME;
    slot_end_time TIME;
BEGIN
    WHILE current_date <= p_end_date LOOP
        current_time := p_opening_time;
        WHILE current_time + INTERVAL '1 minute' * p_slot_duration_minutes <= p_closing_time LOOP
            slot_end_time := current_time + INTERVAL '1 minute' * p_slot_duration_minutes;
            
            INSERT INTO public.time_slots (court_id, date, start_time, end_time, is_available)
            VALUES (p_court_id, current_date, current_time, slot_end_time, true)
            ON CONFLICT (court_id, date, start_time) DO NOTHING;
            
            current_time := slot_end_time;
        END LOOP;
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Public profile view" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Self update profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated users can insert their profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs/Courts Policies
CREATE POLICY "Public club view" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Owner/Admin manage clubs" ON public.clubs FOR ALL USING (owner_id = auth.uid() OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public court view" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Owner/Admin manage courts" ON public.courts FOR ALL USING (EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND owner_id = auth.uid()) OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Time Slots Policies
CREATE POLICY "Public time slot view" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Owner/Admin manage time slots" ON public.time_slots FOR ALL USING (EXISTS (SELECT 1 FROM public.courts WHERE id = court_id AND club_id IN (SELECT id FROM public.clubs WHERE owner_id = auth.uid())) OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Bookings Policies
CREATE POLICY "Customer view own" ON public.bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Owner view related" ON public.bookings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Admin view all" ON public.bookings FOR SELECT USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Customer book" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Payments Policies
CREATE POLICY "Users view related payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND (customer_id = auth.uid() OR owner_id = auth.uid()))
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Reviews Policies
CREATE POLICY "Public review view" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customer create review" ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customer update own review" ON public.reviews FOR UPDATE USING (customer_id = auth.uid());

-- Favorites Policies
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (user_id = auth.uid());

-- Notifications Policies
CREATE POLICY "User view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User delete own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Payout Requests Policies
CREATE POLICY "Owner view own payouts" ON public.payout_requests FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Owner create payout requests" ON public.payout_requests FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admin manage all payouts" ON public.payout_requests FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Platform Settings Policies
CREATE POLICY "Admin manage settings" ON public.platform_settings FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public view settings" ON public.platform_settings FOR SELECT USING (true);

-- ==========================================
-- 16. ADMIN STATS VIEW
-- ==========================================
CREATE OR REPLACE VIEW public.vw_admin_dashboard AS
SELECT 
    (SELECT count(*) FROM public.user_profiles WHERE role = 'customer') as total_customers,
    (SELECT count(*) FROM public.user_profiles WHERE role = 'club_owner') as total_owners,
    (SELECT count(*) FROM public.clubs WHERE is_active = true) as total_active_clubs,
    (SELECT count(*) FROM public.bookings WHERE status = 'confirmed') as total_confirmed_bookings,
    (SELECT sum(total_price) FROM public.bookings WHERE status = 'confirmed') as gross_revenue,
    (SELECT sum(commission_amount) FROM public.bookings WHERE status = 'confirmed') as platform_net_revenue;

-- ==========================================
-- 17. SAMPLE DATA (OPTIONAL - UNCOMMENT FOR TESTING)
-- ==========================================

-- Insert default platform settings
INSERT INTO public.platform_settings (commission_rate, refund_threshold_hours, currency) 
VALUES (10.00, 24, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Sample admin user (requires Supabse Auth user creation first)
-- INSERT INTO public.user_profiles (id, email, role, full_name) 
-- VALUES ('ADMIN_UUID_HERE', 'admin@badminton.com', 'admin', 'System Admin');

-- Sample club owner
-- INSERT INTO public.user_profiles (id, email, role, full_name, company_name) 
-- VALUES ('OWNER_UUID_HERE', 'owner@badminton.com', 'club_owner', 'John Owner', 'Badminton Club');

-- Sample customer
-- INSERT INTO public.user_profiles (id, email, role, full_name) 
-- VALUES ('CUSTOMER_UUID_HERE', 'customer@badminton.com', 'customer', 'Jane Player');

-- ==========================================
-- 18. MIGRATION NOTES
-- ==========================================
-- This schema consolidates all existing database files into one comprehensive structure
-- Key improvements:
-- 1. Unified enum types for data consistency
-- 2. Comprehensive RLS policies for security
-- 3. Performance-optimized indexes
-- 4. Automated triggers for timestamps and rating calculations
-- 5. Support for club-based structure (multiple courts per club)
-- 6. Complete financial tracking with payouts
-- 7. Advanced notification system
-- 8. Admin dashboard view
-- 9. Time slot management functions
-- 10. Full integration with Supabase Auth

-- To use this schema:
-- 1. Ensure you have Supabase Auth enabled
-- 2. Run this SQL in your Supabase SQL editor
-- 3. Create users through Supabase Auth first
-- 4. Then insert corresponding profile records using the Auth user IDs