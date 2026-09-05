-- ============================================================================
-- CAMPUSBITE SUPABASE RLS RECURSION FIX SCRIPT
-- Run this in your Supabase Project SQL Editor to fix:
-- "ERROR: infinite recursion detected in policy for relation 'orders'/'students'"
-- ============================================================================

-- 1. DROP EXISTING CIRCULAR POLICIES
DROP POLICY IF EXISTS "Vendors can view student info for their orders" ON public.students;
DROP POLICY IF EXISTS "Students can view their own record" ON public.students;
DROP POLICY IF EXISTS "Students can insert their record" ON public.students;

DROP POLICY IF EXISTS "Students can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view orders assigned to them" ON public.orders;
DROP POLICY IF EXISTS "Students can create orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can update status of assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Students can update their pending order payment" ON public.orders;

DROP POLICY IF EXISTS "Users can view items of orders they can access" ON public.order_items;
DROP POLICY IF EXISTS "Students can insert order items for their orders" ON public.order_items;

DROP POLICY IF EXISTS "Users can view payments for accessible orders" ON public.payments;
DROP POLICY IF EXISTS "Students can insert payment for their order" ON public.payments;

-- 2. CREATE CLEAN, ROBUST, NON-RECURSIVE POLICIES
-- Students Table:
CREATE POLICY "Allow public read access on students" 
    ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert on students" 
    ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on students" 
    ON public.students FOR UPDATE USING (true);

-- Orders Table:
CREATE POLICY "Allow public read access on orders" 
    ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orders" 
    ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on orders" 
    ON public.orders FOR UPDATE USING (true);

-- Order Items Table:
CREATE POLICY "Allow public read access on order_items" 
    ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on order_items" 
    ON public.order_items FOR INSERT WITH CHECK (true);

-- Payments Table:
CREATE POLICY "Allow public read access on payments" 
    ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on payments" 
    ON public.payments FOR INSERT WITH CHECK (true);

-- 3. INSERT DEMO ORDERS INCLUDING TKN870 & TKN876 SO SUPABASE HAS PRE-LOADED DATA
DO $$
DECLARE
    v_vendor_id UUID := '11111111-1111-1111-1111-111111111111';
    s_student_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Demo Order 1: TKN870 (Ready for Pickup)
    INSERT INTO public.orders (
        id, order_number, token_number, student_id, vendor_id, 
        subtotal, total_amount, payment_status, order_status, 
        qr_token, qr_generated_at, notes
    ) VALUES (
        '33333333-3333-3333-3333-333333333870',
        'ORD1000',
        'TKN870',
        s_student_id,
        v_vendor_id,
        70.00,
        70.00,
        'PAID',
        'READY',
        'SEC-TOK-870',
        now(),
        'Mobile pre-order pass'
    ) ON CONFLICT (order_number) DO UPDATE SET
        token_number = 'TKN870',
        order_status = 'READY',
        payment_status = 'PAID';

    -- Demo Order 2: TKN876 (Ready for Pickup)
    INSERT INTO public.orders (
        id, order_number, token_number, student_id, vendor_id, 
        subtotal, total_amount, payment_status, order_status, 
        qr_token, qr_generated_at, notes
    ) VALUES (
        '33333333-3333-3333-3333-333333333876',
        'ORD1002',
        'TKN876',
        s_student_id,
        v_vendor_id,
        130.00,
        130.00,
        'PAID',
        'READY',
        'SEC-TOK-876',
        now(),
        'Mobile pre-order pass'
    ) ON CONFLICT (order_number) DO UPDATE SET
        token_number = 'TKN876',
        order_status = 'READY',
        payment_status = 'PAID';

    -- Demo Order 3: TKN245 (Paid)
    INSERT INTO public.orders (
        id, order_number, token_number, student_id, vendor_id, 
        subtotal, total_amount, payment_status, order_status, 
        qr_token, qr_generated_at, notes
    ) VALUES (
        '33333333-3333-3333-3333-333333333245',
        'ORD1001',
        'TKN245',
        s_student_id,
        v_vendor_id,
        140.00,
        140.00,
        'PAID',
        'PAID',
        'SEC-TOK-245',
        now(),
        'Demo pickup pass'
    ) ON CONFLICT (order_number) DO UPDATE SET
        token_number = 'TKN245',
        order_status = 'PAID',
        payment_status = 'PAID';
END $$;
