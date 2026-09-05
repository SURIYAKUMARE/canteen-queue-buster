-- ============================================================================
-- CAMPUSBITE – SMART COLLEGE CANTEEN DATABASE SCHEMA
-- Target Backend: Supabase (PostgreSQL 15+)
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLE: profiles
-- Links directly to auth.users in Supabase Auth
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'vendor')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: students
-- Student specific information with full academic details
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL, -- e.g. STU001
    college_name TEXT DEFAULT 'Campus College of Engineering',
    department TEXT DEFAULT 'Computer Science',
    year TEXT DEFAULT '3rd Year',
    section TEXT DEFAULT 'A',
    college_email TEXT NOT NULL,
    phone TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: vendors
-- Canteen vendor operations information and configurable GPay/UPI QR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id TEXT UNIQUE NOT NULL, -- e.g. VEN001
    vendor_name TEXT NOT NULL,
    canteen_name TEXT NOT NULL,
    phone TEXT,
    canteen_details TEXT,
    upi_id TEXT DEFAULT 'canteen@okhdfcbank',
    upi_qr_url TEXT, -- Configurable GPay/UPI QR Image uploaded by owner/vendor
    password_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: food_items
-- Food catalog managed by vendors
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Combos')),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 50 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: orders
-- Orders placed by students for vendors
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. ORD1001
    token_number TEXT, -- e.g. TKN245
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    order_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (
        order_status IN ('PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')
    ),
    qr_token TEXT UNIQUE,
    qr_generated_at TIMESTAMPTZ,
    qr_scanned_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: order_items
-- Immutable historical snapshot of items in an order
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
    food_name_snapshot TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_snapshot NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: payments
-- Payment audit logs and transaction verification
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_provider TEXT NOT NULL, -- 'Razorpay', 'UPI', 'RFID_Wallet', 'Card', 'Test_Mode'
    transaction_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: notifications
-- In-app notifications for both students and vendors
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'order_placed', 'order_accepted', 'order_preparing', 'order_ready', 'order_completed', 'order_cancelled'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_profile ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_vendors_profile ON public.vendors(profile_id);
CREATE INDEX IF NOT EXISTS idx_food_items_vendor ON public.food_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON public.food_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_student ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_qr_token ON public.orders(qr_token);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_profile_id);

-- ============================================================================
-- TRIGGERS: AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_food_items_updated_at ON public.food_items;
CREATE TRIGGER trigger_food_items_updated_at
    BEFORE UPDATE ON public.food_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- 2. Students RLS
CREATE POLICY "Students can view their own record"
    ON public.students FOR SELECT
    USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Vendors can view student info for their orders"
    ON public.students FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.vendors v ON v.id = o.vendor_id
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE o.student_id = public.students.id AND p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Students can insert their record"
    ON public.students FOR INSERT
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 3. Vendors RLS
CREATE POLICY "Anyone authenticated can view active vendors"
    ON public.vendors FOR SELECT
    USING (is_active = true);

CREATE POLICY "Vendors can manage their own record"
    ON public.vendors FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 4. Food Items RLS
CREATE POLICY "Anyone can view available food items"
    ON public.food_items FOR SELECT
    USING (true);

CREATE POLICY "Vendors can insert their own food items"
    ON public.food_items FOR INSERT
    WITH CHECK (vendor_id IN (
        SELECT v.id FROM public.vendors v
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Vendors can update their own food items"
    ON public.food_items FOR UPDATE
    USING (vendor_id IN (
        SELECT v.id FROM public.vendors v
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Vendors can delete their own food items"
    ON public.food_items FOR DELETE
    USING (vendor_id IN (
        SELECT v.id FROM public.vendors v
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

-- 5. Orders RLS
CREATE POLICY "Students can view their own orders"
    ON public.orders FOR SELECT
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.profiles p ON p.id = s.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Vendors can view orders assigned to them"
    ON public.orders FOR SELECT
    USING (vendor_id IN (
        SELECT v.id FROM public.vendors v
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Students can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.profiles p ON p.id = s.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Vendors can update status of assigned orders"
    ON public.orders FOR UPDATE
    USING (vendor_id IN (
        SELECT v.id FROM public.vendors v
        JOIN public.profiles p ON p.id = v.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

CREATE POLICY "Students can update their pending order payment"
    ON public.orders FOR UPDATE
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.profiles p ON p.id = s.profile_id
        WHERE p.auth_user_id = auth.uid()
    ));

-- 6. Order Items RLS
CREATE POLICY "Users can view items of orders they can access"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = public.order_items.order_id
    ));

CREATE POLICY "Students can insert order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.students s ON s.id = o.student_id
        JOIN public.profiles p ON p.id = s.profile_id
        WHERE o.id = public.order_items.order_id AND p.auth_user_id = auth.uid()
    ));

-- 7. Payments RLS
CREATE POLICY "Users can view payments for accessible orders"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = public.payments.order_id
    ));

CREATE POLICY "Students can insert payment for their order"
    ON public.payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.students s ON s.id = o.student_id
        JOIN public.profiles p ON p.id = s.profile_id
        WHERE o.id = public.payments.order_id AND p.auth_user_id = auth.uid()
    ));

-- 8. Notifications RLS
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (recipient_profile_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (recipient_profile_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "System and authorized users can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- SUPABASE REALTIME CONFIGURATION
-- ============================================================================
-- Enable real-time listening on tables for instant order alerts & status tracking
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.food_items;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- INITIAL SEED DATA (DEFAULT VENDOR & CANTEEN MENU)
-- ============================================================================

-- Seed Default Vendor Profile & Vendor Record
DO $$
DECLARE
    v_profile_id UUID := '00000000-0000-0000-0000-000000000001';
    v_vendor_id UUID := '11111111-1111-1111-1111-111111111111';
    s_profile_id UUID := '00000000-0000-0000-0000-000000000002';
    s_student_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Insert default vendor profile if not exists
    INSERT INTO public.profiles (id, auth_user_id, full_name, email, phone, role)
    VALUES (v_profile_id, NULL, 'Campus Central Canteen', 'ven001@college.edu', '+91 98765 00001', 'vendor')
    ON CONFLICT (id) DO NOTHING;

    -- Insert default vendor record if not exists
    INSERT INTO public.vendors (id, profile_id, vendor_id, vendor_name, phone, is_active)
    VALUES (v_vendor_id, v_profile_id, 'VEN001', 'Campus Central Canteen', '+91 98765 00001', true)
    ON CONFLICT (id) DO NOTHING;

    -- Insert demo student profile if not exists
    INSERT INTO public.profiles (id, auth_user_id, full_name, email, phone, role)
    VALUES (s_profile_id, NULL, 'Arun Kumar', 'stu001@college.edu', '+91 98765 43210', 'student')
    ON CONFLICT (id) DO NOTHING;

    -- Insert demo student record if not exists
    INSERT INTO public.students (id, profile_id, student_id, college_email, phone)
    VALUES (s_student_id, s_profile_id, 'STU001', 'stu001@college.edu', '+91 98765 43210')
    ON CONFLICT (id) DO NOTHING;

    -- Seed food items
    INSERT INTO public.food_items (id, vendor_id, name, description, category, price, image_url, is_available, stock_quantity)
    VALUES
    ('a0000001-0000-0000-0000-000000000001', v_vendor_id, 'Crispy Masala Dosa', 'Golden fermented crepe filled with spiced potato masala, served with coconut & tomato chutney and piping hot sambar.', 'Breakfast', 55.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', true, 40),
    ('a0000001-0000-0000-0000-000000000002', v_vendor_id, 'Veg Thali Deluxe', '2 Chapatis, fragrant Jeera Rice, Dal Tadka, Paneer Butter Masala, seasonal sabzi, salad, pickle, and Gulab Jamun.', 'Lunch', 85.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', true, 30),
    ('a0000001-0000-0000-0000-000000000003', v_vendor_id, 'Chole Bhature (2 Pcs)', 'Fluffy deep-fried leavened bread served with Amritsari spiced chickpea gravy, pickled onions, and mint chutney.', 'Lunch', 75.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', true, 25),
    ('a0000001-0000-0000-0000-000000000004', v_vendor_id, 'Veg Cheese Grilled Sandwich', 'Three-layered sandwich loaded with cheese, bell peppers, tomatoes, and mint chutney, toasted golden with butter.', 'Snacks', 50.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', true, 50),
    ('a0000001-0000-0000-0000-000000000005', v_vendor_id, 'Paneer Tikka Roll', 'Smoky tandoori paneer cubes wrapped in a soft handmade rumali roti with sliced onions and zesty green chutney.', 'Snacks', 70.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', true, 35),
    ('a0000001-0000-0000-0000-000000000006', v_vendor_id, 'Butter Pav Bhaji', 'Rich, buttery spiced vegetable mash served with two soft toasted pav buns and freshly chopped coriander & lemon.', 'Snacks', 65.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80', true, 40),
    ('a0000001-0000-0000-0000-000000000007', v_vendor_id, 'Kulhad Masala Chai', 'Aromatic slow-brewed Indian tea infused with crushed cardamom, ginger, and cinnamon, served in an earthen kulhad.', 'Drinks', 15.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', true, 100),
    ('a0000001-0000-0000-0000-000000000008', v_vendor_id, 'Thick Cold Coffee with Ice Cream', 'Rich espresso blended with chilled milk and cream, topped with a scoop of vanilla ice cream and chocolate drizzle.', 'Drinks', 45.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', true, 50),
    ('a0000001-0000-0000-0000-000000000009', v_vendor_id, 'Express Breakfast Combo', 'Crispy Masala Dosa + 1 Hot Vada + Kulhad Masala Chai. Quick morning fuel for students on the rush.', 'Combos', 75.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', true, 25),
    ('a0000001-0000-0000-0000-000000000010', v_vendor_id, 'Study Fuel Snack Box', 'Veg Cheese Grilled Sandwich + French Fries + Cold Coffee with Ice Cream. Ideal for library study sessions.', 'Combos', 110.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', true, 30)
    ON CONFLICT (id) DO NOTHING;
END $$;
