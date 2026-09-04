import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { initialCampusMenu } from '../../server/data/campusMenu.js';
import { initialSeedOrders } from '../../server/data/seedOrders.js';

// Global Event Emitter for Realtime pub-sub
class RealtimeEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('Realtime callback error:', e); }
      });
    }
  }
}

export const realtimeEmitter = new RealtimeEmitter();

// ============================================================================
// LOCAL RESILIENT ENGINE (Matches Supabase schema exactly)
// Initialized from schema.sql seed data if live Supabase is not yet configured
// ============================================================================
const STORAGE_PREFIX = 'CAMPUSBITE_DB_';

function getLocalTable(table, defaultVal = []) {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(STORAGE_PREFIX + table);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* fallback */ }
  }
  return defaultVal;
}

function setLocalTable(table, data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
  }
}

// Default Seed Data for local store
const DEFAULT_VENDORS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    profile_id: '00000000-0000-0000-0000-000000000001',
    vendor_id: 'VEN001',
    vendor_name: 'Campus Central Canteen',
    phone: '+91 98765 00001',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PROFILES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    auth_user_id: 'mock-vendor-auth-id',
    full_name: 'Campus Central Canteen',
    email: 'ven001@college.edu',
    phone: '+91 98765 00001',
    role: 'vendor',
    created_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    auth_user_id: 'mock-student-auth-id',
    full_name: 'Arun Kumar',
    email: 'stu001@college.edu',
    phone: '+91 98765 43210',
    role: 'student',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_STUDENTS = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    profile_id: '00000000-0000-0000-0000-000000000002',
    student_id: 'STU001',
    college_email: 'stu001@college.edu',
    phone: '+91 98765 43210',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_FOOD_ITEMS = initialCampusMenu.map((m, idx) => ({
  id: `a0000001-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
  vendor_id: DEFAULT_VENDORS[0].id,
  name: m.name,
  description: m.description || '',
  category: m.category || 'Snacks',
  price: Number(m.price) || 50,
  image: m.image,
  image_url: m.image,
  is_available: m.isAvailable !== false,
  available: m.isAvailable !== false,
  stock_quantity: 40,
  is_veg: m.isVeg !== false,
  isVeg: m.isVeg !== false,
  prep_time: m.prepTimeMinutes || m.prepTime || 5,
  prepTimeMinutes: m.prepTimeMinutes || m.prepTime || 5,
  calories: m.calories || '350 kcal',
  rating: m.rating || 4.8,
  tags: m.tags || ['Popular'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

// Initialize local storage with resilient demo data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_PREFIX + 'food_items')) {
    setLocalTable('food_items', DEFAULT_FOOD_ITEMS);
  }
  // Always ensure demo profiles exist
  setLocalTable('profiles', DEFAULT_PROFILES);
  setLocalTable('vendors', DEFAULT_VENDORS);
  setLocalTable('students', DEFAULT_STUDENTS);

  // Transform seed orders to match Supabase schema safely
  const seed = (initialSeedOrders || []).map((ord, idx) => {
    const orderItems = ord.foodItems || ord.items || [];
    const orderNum = ord.orderId || ord.orderNumber || `ORD100${idx + 1}`;
    const tokenNum = ord.tokenNumber || `TKN24${idx + 5}`;
    const amount = Number(ord.totalAmount) || 100;
    const status = ord.orderStatus || ord.status || 'PAID';

    return {
      id: `ord-uuid-${idx + 1}`,
      order_number: orderNum,
      orderId: orderNum,
      token_number: tokenNum,
      tokenNumber: tokenNum,
      student_id: DEFAULT_STUDENTS[0].id,
      studentId: ord.studentId || 'STU001',
      studentName: ord.studentName || 'Arun Kumar',
      vendor_id: DEFAULT_VENDORS[0].id,
      subtotal: amount,
      total_amount: amount,
      totalAmount: amount,
      payment_status: ord.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
      paymentStatus: ord.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
      order_status: status,
      orderStatus: status,
      qr_token: ord.qrToken || `SEC-TOK-${1000 + idx + 1}`,
      qr_generated_at: new Date().toISOString(),
      qr_scanned_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      notes: ord.notes || '',
      created_at: new Date(Date.now() - (idx * 20 * 60 * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems.map(it => ({
        id: `oi-${Math.random().toString(36).substring(2, 8)}`,
        name: it.name,
        food_name_snapshot: it.name,
        quantity: it.quantity || 1,
        price: it.price || 50,
        price_snapshot: it.price || 50,
        subtotal: (it.price || 50) * (it.quantity || 1)
      })),
      foodItems: orderItems.map(it => ({
        id: `oi-${Math.random().toString(36).substring(2, 8)}`,
        name: it.name,
        food_name_snapshot: it.name,
        quantity: it.quantity || 1,
        price: it.price || 50,
        price_snapshot: it.price || 50,
        subtotal: (it.price || 50) * (it.quantity || 1)
      }))
    };
  });
  setLocalTable('orders', seed);
}

// ============================================================================
// DATABASE SERVICE API
// ============================================================================
export const databaseService = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------------------------------
  async signUpStudent({ fullName, studentId, email, phone, password }) {
    if (isSupabaseConfigured && supabase) {
      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'student' }
        }
      });
      if (authError) throw authError;

      const authUserId = authData.user?.id;

      // 2. Insert Profile
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .insert([{ auth_user_id: authUserId, full_name: fullName, email, phone, role: 'student' }])
        .select()
        .single();
      if (profError) throw profError;

      // 3. Insert Student Record
      const { data: student, error: stuError } = await supabase
        .from('students')
        .insert([{ profile_id: profile.id, student_id: studentId, college_email: email, phone }])
        .select()
        .single();
      if (stuError) throw stuError;

      return { profile, student, user: authData.user };
    } else {
      // Local Resilient Engine
      const profiles = getLocalTable('profiles');
      const students = getLocalTable('students');

      if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
      }
      if (students.some(s => s.student_id.toUpperCase() === studentId.toUpperCase())) {
        throw new Error('This Student ID / Roll number is already registered.');
      }

      const newProfile = {
        id: crypto.randomUUID(),
        auth_user_id: 'mock-' + crypto.randomUUID(),
        full_name: fullName,
        email,
        phone,
        role: 'student',
        created_at: new Date().toISOString()
      };
      const newStudent = {
        id: crypto.randomUUID(),
        profile_id: newProfile.id,
        student_id: studentId.toUpperCase(),
        college_email: email,
        phone,
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      students.push(newStudent);
      setLocalTable('profiles', profiles);
      setLocalTable('students', students);

      return { profile: newProfile, student: newStudent, user: { id: newProfile.auth_user_id, email } };
    }
  },

  async signUpVendor({ vendorName, vendorId, email, phone, password }) {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: vendorName, role: 'vendor' }
        }
      });
      if (authError) throw authError;

      const authUserId = authData.user?.id;

      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .insert([{ auth_user_id: authUserId, full_name: vendorName, email, phone, role: 'vendor' }])
        .select()
        .single();
      if (profError) throw profError;

      const { data: vendor, error: venError } = await supabase
        .from('vendors')
        .insert([{ profile_id: profile.id, vendor_id: vendorId, vendor_name: vendorName, phone, is_active: true }])
        .select()
        .single();
      if (venError) throw venError;

      return { profile, vendor, user: authData.user };
    } else {
      const profiles = getLocalTable('profiles');
      const vendors = getLocalTable('vendors');

      if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
      }

      const newProfile = {
        id: crypto.randomUUID(),
        auth_user_id: 'mock-' + crypto.randomUUID(),
        full_name: vendorName,
        email,
        phone,
        role: 'vendor',
        created_at: new Date().toISOString()
      };
      const newVendor = {
        id: crypto.randomUUID(),
        profile_id: newProfile.id,
        vendor_id: vendorId.toUpperCase(),
        vendor_name: vendorName,
        phone,
        is_active: true,
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      vendors.push(newVendor);
      setLocalTable('profiles', profiles);
      setLocalTable('vendors', vendors);

      return { profile: newProfile, vendor: newVendor, user: { id: newProfile.auth_user_id, email } };
    }
  },

  async signIn({ email, studentId, vendorId, identifier, password, role }) {
    const input = (identifier || studentId || vendorId || email || '').trim();
    const pwd = (password || '').trim();

    const isStuDemo = input.toUpperCase() === 'STU001' || input.toLowerCase() === 'stu001@college.edu';
    const isVenDemo = input.toUpperCase() === 'VEN001' || input.toLowerCase() === 'ven001@college.edu';

    // 1. Direct Demo Account verification
    if (isStuDemo) {
      if (pwd && pwd !== 'student123') {
        throw new Error('Invalid password for Student STU001. Password is: student123');
      }
      return {
        profile: DEFAULT_PROFILES[1],
        student: DEFAULT_STUDENTS[0],
        user: { id: DEFAULT_PROFILES[1].auth_user_id, email: DEFAULT_PROFILES[1].email }
      };
    }

    if (isVenDemo) {
      if (pwd && pwd !== 'vendor123') {
        throw new Error('Invalid password for Vendor VEN001. Password is: vendor123');
      }
      return {
        profile: DEFAULT_PROFILES[0],
        vendor: DEFAULT_VENDORS[0],
        user: { id: DEFAULT_PROFILES[0].auth_user_id, email: DEFAULT_PROFILES[0].email }
      };
    }

    // 2. Supabase Cloud Auth attempt if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: input.includes('@') ? input : (role === 'vendor' ? 'ven001@college.edu' : 'stu001@college.edu'),
          password: pwd
        });
        if (!authError && authData?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          let roleDetails = null;
          if (profile?.role === 'student') {
            const { data: stu } = await supabase.from('students').select('*').eq('profile_id', profile.id).single();
            roleDetails = { student: stu };
          } else if (profile?.role === 'vendor') {
            const { data: ven } = await supabase.from('vendors').select('*').eq('profile_id', profile.id).single();
            roleDetails = { vendor: ven };
          }
          return { profile, user: authData.user, ...roleDetails };
        }
      } catch (e) {
        console.warn('Supabase signin attempt fallback:', e.message);
      }
    }

    // 3. Resilient Local Engine Profiles
    const profiles = getLocalTable('profiles', DEFAULT_PROFILES);
    const profile = profiles.find(p => 
      p.email?.toLowerCase() === input.toLowerCase() ||
      (p.role === 'student' && (input.toUpperCase() === 'STU001' || role === 'student')) ||
      (p.role === 'vendor' && (input.toUpperCase() === 'VEN001' || role === 'vendor'))
    );

    if (!profile) {
      throw new Error(`Account '${input}' not found. Please use demo credentials:\nStudent: STU001 / student123\nVendor: VEN001 / vendor123`);
    }

    let roleDetails = null;
    if (profile.role === 'student') {
      const students = getLocalTable('students', DEFAULT_STUDENTS);
      const stu = students.find(s => s.profile_id === profile.id) || DEFAULT_STUDENTS[0];
      roleDetails = { student: stu };
    } else if (profile.role === 'vendor') {
      const vendors = getLocalTable('vendors', DEFAULT_VENDORS);
      const ven = vendors.find(v => v.profile_id === profile.id) || DEFAULT_VENDORS[0];
      roleDetails = { vendor: ven };
    }

    return { profile, user: { id: profile.auth_user_id, email: profile.email }, ...roleDetails };
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  // --------------------------------------------------------------------------
  // FOOD ITEMS & MENU
  // --------------------------------------------------------------------------
  async getFoodItems() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      return data;
    } else {
      return getLocalTable('food_items', DEFAULT_FOOD_ITEMS);
    }
  },

  async addFoodItem(itemData, vendorId) {
    const newItem = {
      id: crypto.randomUUID(),
      vendor_id: vendorId || DEFAULT_VENDORS[0].id,
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || 'Snacks',
      price: parseFloat(itemData.price),
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      is_available: itemData.is_available !== false,
      stock_quantity: parseInt(itemData.stock_quantity) || 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('food_items').insert([newItem]).select().single();
      if (error) throw error;
      return data;
    } else {
      const items = getLocalTable('food_items');
      items.unshift(newItem);
      setLocalTable('food_items', items);
      realtimeEmitter.emit('FOOD_ITEMS_CHANGED', items);
      return newItem;
    }
  },

  async updateFoodItem(itemId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('food_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const items = getLocalTable('food_items');
      const idx = items.findIndex(it => it.id === itemId);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
        setLocalTable('food_items', items);
        realtimeEmitter.emit('FOOD_ITEMS_CHANGED', items);
        return items[idx];
      }
      throw new Error('Food item not found.');
    }
  },

  async deleteFoodItem(itemId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('food_items').delete().eq('id', itemId);
      if (error) throw error;
      return true;
    } else {
      let items = getLocalTable('food_items');
      items = items.filter(it => it.id !== itemId);
      setLocalTable('food_items', items);
      realtimeEmitter.emit('FOOD_ITEMS_CHANGED', items);
      return true;
    }
  },

  // --------------------------------------------------------------------------
  // ORDERS & CHECKOUT
  // --------------------------------------------------------------------------
  async createPendingOrder({ studentId, vendorId, studentName, items, subtotal, totalAmount, notes = '' }) {
    // Generate realistic Order ID (e.g. ORD1001) and Token Number (e.g. TKN245)
    const existingOrders = getLocalTable('orders', []);
    const orderNumber = `ORD${1001 + existingOrders.length}`;
    const tokenNumber = `TKN${Math.floor(200 + Math.random() * 790)}`;

    const validUUID = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const parsedSubtotal = parseFloat(subtotal) || 0;
    const parsedTotal = parseFloat(totalAmount) || parsedSubtotal;

    const orderRow = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      orderId: orderNumber,
      token_number: tokenNumber,
      tokenNumber: tokenNumber,
      student_id: validUUID(studentId) ? studentId : DEFAULT_STUDENTS[0].id,
      studentId: validUUID(studentId) ? studentId : DEFAULT_STUDENTS[0].student_id,
      studentName: studentName || DEFAULT_PROFILES[1].full_name,
      vendor_id: validUUID(vendorId) ? vendorId : DEFAULT_VENDORS[0].id,
      subtotal: parsedSubtotal,
      total_amount: parsedTotal,
      totalAmount: parsedTotal,
      payment_status: 'PENDING',
      paymentStatus: 'PENDING',
      order_status: 'PENDING_PAYMENT',
      orderStatus: 'PENDING_PAYMENT',
      qr_token: null,
      qr_generated_at: null,
      qr_scanned_at: null,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const orderItemsRows = items.map(item => ({
      id: crypto.randomUUID(),
      order_id: orderRow.id,
      food_item_id: validUUID(item.id) ? item.id : null,
      food_name_snapshot: item.name,
      name: item.name,
      quantity: item.quantity,
      price_snapshot: parseFloat(item.price) || 0,
      price: parseFloat(item.price) || 0,
      subtotal: (parseFloat(item.price) || 0) * (item.quantity || 1)
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const supabaseOrderPayload = {
          id: orderRow.id,
          order_number: orderRow.order_number,
          token_number: orderRow.token_number,
          student_id: orderRow.student_id,
          vendor_id: orderRow.vendor_id,
          subtotal: orderRow.subtotal,
          total_amount: orderRow.total_amount,
          payment_status: orderRow.payment_status,
          order_status: orderRow.order_status,
          qr_token: orderRow.qr_token,
          qr_generated_at: orderRow.qr_generated_at,
          qr_scanned_at: orderRow.qr_scanned_at,
          notes: orderRow.notes,
          created_at: orderRow.created_at,
          updated_at: orderRow.updated_at
        };
        const { data: order, error: ordError } = await supabase.from('orders').insert([supabaseOrderPayload]).select().single();
        if (!ordError && order) {
          const supabaseItemsPayload = orderItemsRows.map(it => ({
            id: it.id,
            order_id: it.order_id,
            food_item_id: it.food_item_id,
            food_name_snapshot: it.food_name_snapshot,
            quantity: it.quantity,
            price_snapshot: it.price_snapshot,
            subtotal: it.subtotal
          }));
          await supabase.from('order_items').insert(supabaseItemsPayload);
        }
      } catch (e) {
        console.warn('Supabase createPendingOrder fallback:', e.message);
      }
    }

    const fullOrder = { ...orderRow, items: orderItemsRows, foodItems: orderItemsRows, order_items: orderItemsRows };
    const orders = getLocalTable('orders', []);
    orders.unshift(fullOrder);
    setLocalTable('orders', orders);
    return fullOrder;
  },

  async completePayment({ orderId, paymentProvider, transactionId, amount }) {
    const qrToken = `SEC-TOK-${crypto.randomUUID()}`;
    const paidAt = new Date().toISOString();

    const paymentRow = {
      id: crypto.randomUUID(),
      order_id: orderId,
      payment_provider: paymentProvider,
      transaction_id: transactionId || `TXN-${Date.now()}`,
      amount: parseFloat(amount),
      status: 'SUCCESS',
      paid_at: paidAt,
      created_at: paidAt
    };

    let updatedOrder = null;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').insert([paymentRow]);
        const { data, error } = await supabase
          .from('orders')
          .update({
            payment_status: 'PAID',
            order_status: 'PAID',
            qr_token: qrToken,
            qr_generated_at: paidAt,
            updated_at: paidAt
          })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`)
          .select('*, order_items(*), students(*)')
          .maybeSingle();
        if (!error && data) updatedOrder = data;
      } catch (e) {
        console.warn('Supabase completePayment fallback:', e.message);
      }
    }

    const orders = getLocalTable('orders', []);
    const idx = orders.findIndex(o => o.id === orderId || o.order_number === orderId || o.orderId === orderId);
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        payment_status: 'PAID',
        paymentStatus: 'PAID',
        order_status: 'PAID',
        orderStatus: 'PAID',
        qr_token: qrToken,
        qr_generated_at: paidAt,
        updated_at: paidAt,
        payment: paymentRow
      };
      setLocalTable('orders', orders);
      if (!updatedOrder) updatedOrder = orders[idx];
    }

    if (updatedOrder) {
      // Notify Realtime channels of new paid order immediately
      realtimeEmitter.emit('NEW_PAID_ORDER', updatedOrder);
      realtimeEmitter.emit('ORDER_UPDATED', updatedOrder);
      return updatedOrder;
    }
    throw new Error('Order not found for payment completion.');
  },

  async getOrders(filter = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*), students(*)')
          .order('created_at', { ascending: false });

        if (filter.studentId) query = query.eq('student_id', filter.studentId);
        if (filter.vendorId) query = query.eq('vendor_id', filter.vendorId);
        if (filter.status && filter.status !== 'ALL') query = query.eq('order_status', filter.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getOrders fallback:', e.message);
      }
    }

    let orders = getLocalTable('orders', []);
    if (filter.studentId) {
      orders = orders.filter(o => o.student_id === filter.studentId);
    }
    if (filter.status && filter.status !== 'ALL') {
      orders = orders.filter(o => o.order_status === filter.status);
    }
    return orders;
  },

  async updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updatedAt = new Date().toISOString();
    let updatedOrder = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const updates = { order_status: newStatus, updated_at: updatedAt };
        if (newStatus === 'COMPLETED') {
          updates.qr_scanned_at = updatedAt;
        }
        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .or(`id.eq.${orderId},order_number.eq.${orderId}`)
          .select('*, order_items(*), students(*)')
          .maybeSingle();
        if (!error && data) updatedOrder = data;
      } catch (e) {
        console.warn('Supabase updateOrderStatus fallback:', e.message);
      }
    }

    const orders = getLocalTable('orders', []);
    const idx = orders.findIndex(o => o.id === orderId || o.order_number === orderId || o.orderId === orderId);
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        order_status: newStatus,
        orderStatus: newStatus,
        updated_at: updatedAt,
        ...(newStatus === 'COMPLETED' ? { qr_scanned_at: updatedAt } : {})
      };
      setLocalTable('orders', orders);
      realtimeEmitter.emit('ORDER_UPDATED', orders[idx]);
      if (!updatedOrder) updatedOrder = orders[idx];
    }

    return updatedOrder || { order_status: newStatus, updated_at: updatedAt };
  },

  // --------------------------------------------------------------------------
  // QR CODE VALIDATION & REDEMPTION (VENDOR CAMERA SCANNER)
  // --------------------------------------------------------------------------
  async verifyQRCode({ orderId, qrToken, tokenNumber, rawPayload, vendorId }) {
    let targetOrderId = orderId;
    let targetTokenNumber = tokenNumber;
    let targetQrToken = qrToken;

    if (rawPayload && typeof rawPayload === 'string') {
      try {
        const parsed = JSON.parse(rawPayload);
        if (parsed.orderId || parsed.orderNumber) targetOrderId = parsed.orderId || parsed.orderNumber;
        if (parsed.tokenNumber) targetTokenNumber = parsed.tokenNumber;
        if (parsed.token || parsed.qrToken) targetQrToken = parsed.token || parsed.qrToken;
      } catch (e) {
        if (!targetOrderId) targetOrderId = rawPayload.trim();
      }
    }

    let order = null;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('orders').select('*, order_items(*), students(*, profiles(*))');
        if (targetOrderId && targetOrderId.startsWith('ORD')) {
          query = query.eq('order_number', targetOrderId);
        } else if (targetOrderId && targetOrderId.includes('-')) {
          query = query.eq('id', targetOrderId);
        } else if (targetTokenNumber) {
          query = query.eq('token_number', targetTokenNumber);
        } else if (targetOrderId) {
          query = query.or(`order_number.eq.${targetOrderId},id.eq.${targetOrderId}`);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) order = data;
      } catch (e) {
        console.warn('Supabase verifyQRCode fallback:', e.message);
      }
    }

    if (!order) {
      const orders = getLocalTable('orders', []);
      order = orders.find(o => 
        (targetOrderId && (o.id === targetOrderId || o.order_number === targetOrderId || o.orderId === targetOrderId)) ||
        (targetTokenNumber && (o.token_number === targetTokenNumber || o.tokenNumber === targetTokenNumber)) ||
        (targetQrToken && o.qr_token === targetQrToken)
      );
    }

    if (!order) {
      return { valid: false, reason: 'Invalid Order / QR: Order not found in database.' };
    }

    // 1. Payment validation
    if (order.payment_status !== 'PAID') {
      return { valid: false, reason: `Invalid Order / QR: Payment has not been completed. Status: ${order.payment_status}` };
    }

    // 2. One-time redemption validation (Prevent Replay / Reuse)
    if (order.order_status === 'COMPLETED' || order.qr_scanned_at) {
      return {
        valid: false,
        isReused: true,
        reason: 'Invalid Order / QR: Food has ALREADY been collected. QR pass is expired.'
      };
    }

    if (order.order_status === 'CANCELLED') {
      return { valid: false, reason: 'Invalid Order / QR: Order was cancelled or refunded.' };
    }

    // Return verified order details
    const studentInfo = order.students || {
      student_id: order.studentId || 'STU001',
      full_name: order.studentName || 'Arun Kumar'
    };

    const items = order.order_items || order.items || order.foodItems || [];

    return {
      valid: true,
      order,
      orderId: order.order_number || order.orderId || order.id,
      tokenNumber: order.token_number || order.tokenNumber || 'TKN245',
      studentName: studentInfo.profiles?.full_name || studentInfo.full_name || order.studentName || 'Arun Kumar',
      studentId: studentInfo.student_id || order.studentId || 'STU001',
      items,
      totalAmount: Number(order.total_amount || order.totalAmount || 0),
      paymentStatus: 'PAID'
    };
  },

  async confirmFoodHandover(orderId) {
    const updatedAt = new Date().toISOString();
    let updatedOrder = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ order_status: 'COMPLETED', qr_scanned_at: updatedAt, updated_at: updatedAt })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`)
          .select('*, order_items(*), students(*)')
          .maybeSingle();
        if (!error && data) updatedOrder = data;
      } catch (e) {
        console.warn('Supabase confirmFoodHandover fallback:', e.message);
      }
    }

    const orders = getLocalTable('orders', []);
    const idx = orders.findIndex(o => o.id === orderId || o.order_number === orderId || o.orderId === orderId);
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        order_status: 'COMPLETED',
        orderStatus: 'COMPLETED',
        qr_scanned_at: updatedAt,
        updated_at: updatedAt
      };
      setLocalTable('orders', orders);
      realtimeEmitter.emit('ORDER_UPDATED', orders[idx]);
      if (!updatedOrder) updatedOrder = orders[idx];
    }

    return updatedOrder || { order_status: 'COMPLETED', qr_scanned_at: updatedAt };
  },

  async confirmFoodCollection(orderId) {
    return this.confirmFoodHandover(orderId);
  },

  // --------------------------------------------------------------------------
  // VENDOR REAL-TIME DASHBOARD METRICS
  // --------------------------------------------------------------------------
  async getVendorMetrics(vendorId) {
    const orders = await this.getOrders({ vendorId });
    const today = new Date().toDateString();

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today || !o.created_at);

    const totalRevenue = todayOrders
      .filter(o => o.payment_status === 'PAID')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pending = todayOrders.filter(o => o.order_status === 'PAID' || o.order_status === 'PENDING_PAYMENT').length;
    const preparing = todayOrders.filter(o => o.order_status === 'ACCEPTED' || o.order_status === 'PREPARING').length;
    const ready = todayOrders.filter(o => o.order_status === 'READY').length;
    const completed = todayOrders.filter(o => o.order_status === 'COMPLETED').length;

    return {
      totalRevenue,
      todayTotalCount: todayOrders.length,
      pendingCount: pending,
      preparingCount: preparing,
      readyCount: ready,
      completedCount: completed
    };
  }
};
