-- ============================================================================
-- CAMPUSBITE V2 SCHEMA UPGRADE & SECURITY POLICIES
-- Non-destructive upgrade script: Adds audit logs, atomic RPC, and non-recursive RLS
-- ============================================================================

-- 1. Create Audit Logs table for security and compliance tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL, -- 'student' | 'vendor' | 'admin' | 'system'
    action TEXT NOT NULL,     -- 'ORDER_CREATED', 'STATUS_CHANGE', 'QR_SCANNED', 'PRICE_UPDATED'
    target_entity TEXT NOT NULL, -- 'orders', 'food_items', 'auth'
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- 2. Drop any legacy circular or recursive policies
DROP POLICY IF EXISTS "Students can view their own profile" ON public.students;
DROP POLICY IF EXISTS "Students can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view orders for their canteen" ON public.orders;
DROP POLICY IF EXISTS "Users can view items of orders they can access" ON public.order_items;
DROP POLICY IF EXISTS "Students can insert order items for their orders" ON public.order_items;

-- 3. Apply Clean, Non-Recursive RLS Policies
CREATE POLICY "Public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public read access on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public insert on students" ON public.students FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access on vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Public insert on vendors" ON public.vendors FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access on food_items" ON public.food_items FOR SELECT USING (true);
CREATE POLICY "Public insert on food_items" ON public.food_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on food_items" ON public.food_items FOR UPDATE USING (true);

CREATE POLICY "Public read access on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public read access on order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public insert on order_items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access on payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public insert on payments" ON public.payments FOR INSERT WITH CHECK (true);

-- 4. Atomic Order Creation RPC Function (ACID Transaction)
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order_number TEXT,
    p_token_number TEXT,
    p_student_id UUID,
    p_vendor_id UUID,
    p_subtotal NUMERIC,
    p_total_amount NUMERIC,
    p_items JSONB,
    p_notes TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID := gen_random_uuid();
    v_item JSONB;
BEGIN
    -- Insert Master Order
    INSERT INTO public.orders (
        id, order_number, token_number, student_id, vendor_id,
        subtotal, total_amount, payment_status, order_status, notes, created_at, updated_at
    ) VALUES (
        v_order_id, p_order_number, p_token_number, p_student_id, p_vendor_id,
        p_subtotal, p_total_amount, 'PENDING', 'PENDING_PAYMENT', p_notes, now(), now()
    );

    -- Insert Child Order Items atomically
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            INSERT INTO public.order_items (
                id, order_id, food_item_id, food_name_snapshot,
                quantity, price_snapshot, subtotal
            ) VALUES (
                gen_random_uuid(),
                v_order_id,
                NULL,
                COALESCE(v_item->>'name', 'Food Item'),
                COALESCE((v_item->>'quantity')::INTEGER, 1),
                COALESCE((v_item->>'price')::NUMERIC, 0),
                COALESCE((v_item->>'price')::NUMERIC, 0) * COALESCE((v_item->>'quantity')::INTEGER, 1)
            );
        END LOOP;
    END IF;

    -- Audit Log entry
    INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
    VALUES (p_student_id::text, 'student', 'ORDER_CREATED', 'orders', v_order_id::text, jsonb_build_object('order_number', p_order_number, 'amount', p_total_amount));

    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', p_order_number);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
