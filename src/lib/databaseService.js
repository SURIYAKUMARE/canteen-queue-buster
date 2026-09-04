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
    vendor_id: 'VND-01',
    vendor_name: 'Campus Central Kitchen (Bay 1 & 2)',
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
    email: 'canteen@college.edu',
    phone: '+91 98765 00001',
    role: 'vendor',
    created_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    auth_user_id: 'mock-student-auth-id',
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    phone: '+91 98765 43210',
    role: 'student',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_STUDENTS = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    profile_id: '00000000-0000-0000-0000-000000000002',
    student_id: '21BCS042',
    college_email: 'rahul.sharma@college.edu',
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

// Initialize local storage if empty
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_PREFIX + 'food_items')) {
    setLocalTable('food_items', DEFAULT_FOOD_ITEMS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'profiles')) {
    setLocalTable('profiles', DEFAULT_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'vendors')) {
    setLocalTable('vendors', DEFAULT_VENDORS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'students')) {
    setLocalTable('students', DEFAULT_STUDENTS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'orders')) {
    // Transform seed orders to match Supabase schema safely
    const seed = (initialSeedOrders || []).map((ord, idx) => {
      const orderItems = ord.foodItems || ord.items || [];
      const orderNum = ord.orderId || ord.orderNumber || `CB-849${idx + 1}`;
      const amount = Number(ord.totalAmount) || 100;
      const status = ord.orderStatus || ord.status || 'PAID';

      return {
        id: `ord-uuid-${idx + 1}`,
        order_number: orderNum,
        orderId: orderNum,
        student_id: DEFAULT_STUDENTS[0].id,
        studentId: ord.studentId || '21BCS042',
        studentName: ord.studentName || 'Rahul Sharma',
        vendor_id: DEFAULT_VENDORS[0].id,
        subtotal: amount,
        total_amount: amount,
        totalAmount: amount,
        payment_status: ord.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        paymentStatus: ord.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        order_status: status,
        orderStatus: status,
        qr_token: ord.qrToken || `qr-tok-${idx + 1}-${Math.random().toString(36).substring(2, 9)}`,
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

  async signIn({ email, password }) {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Fetch profile
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();
      if (profError) throw profError;

      let roleDetails = null;
      if (profile.role === 'student') {
        const { data: stu } = await supabase.from('students').select('*').eq('profile_id', profile.id).single();
        roleDetails = { student: stu };
      } else if (profile.role === 'vendor') {
        const { data: ven } = await supabase.from('vendors').select('*').eq('profile_id', profile.id).single();
        roleDetails = { vendor: ven };
      }

      return { profile, user: authData.user, ...roleDetails };
    } else {
      const profiles = getLocalTable('profiles');
      const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        throw new Error('Invalid email or password. Please verify credentials or register a new account.');
      }

      let roleDetails = null;
      if (profile.role === 'student') {
        const students = getLocalTable('students');
        const stu = students.find(s => s.profile_id === profile.id) || DEFAULT_STUDENTS[0];
        roleDetails = { student: stu };
      } else if (profile.role === 'vendor') {
        const vendors = getLocalTable('vendors');
        const ven = vendors.find(v => v.profile_id === profile.id) || DEFAULT_VENDORS[0];
        roleDetails = { vendor: ven };
      }

      return { profile, user: { id: profile.auth_user_id, email: profile.email }, ...roleDetails };
    }
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
  async createPendingOrder({ studentId, vendorId, items, subtotal, totalAmount, notes = '' }) {
    const orderNumber = `CB-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderRow = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      student_id: studentId || DEFAULT_STUDENTS[0].id,
      vendor_id: vendorId || DEFAULT_VENDORS[0].id,
      subtotal: parseFloat(subtotal),
      total_amount: parseFloat(totalAmount),
      payment_status: 'PENDING',
      order_status: 'PENDING_PAYMENT',
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
      food_item_id: item.id,
      food_name_snapshot: item.name,
      quantity: item.quantity,
      price_snapshot: parseFloat(item.price),
      subtotal: parseFloat(item.price * item.quantity)
    }));

    if (isSupabaseConfigured && supabase) {
      const { data: order, error: ordError } = await supabase.from('orders').insert([orderRow]).select().single();
      if (ordError) throw ordError;

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsRows);
      if (itemsError) throw itemsError;

      return { ...order, items: orderItemsRows };
    } else {
      const orders = getLocalTable('orders');
      const fullOrder = { ...orderRow, items: orderItemsRows };
      orders.unshift(fullOrder);
      setLocalTable('orders', orders);
      return fullOrder;
    }
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

    if (isSupabaseConfigured && supabase) {
      // 1. Insert payment record
      const { error: payError } = await supabase.from('payments').insert([paymentRow]);
      if (payError) throw payError;

      // 2. Update order to PAID + generate unique QR token
      const { data: updatedOrder, error: ordError } = await supabase
        .from('orders')
        .update({
          payment_status: 'PAID',
          order_status: 'PAID',
          qr_token: qrToken,
          qr_generated_at: paidAt,
          updated_at: paidAt
        })
        .eq('id', orderId)
        .select('*, order_items(*), students(*)')
        .single();
      if (ordError) throw ordError;

      return updatedOrder;
    } else {
      const orders = getLocalTable('orders');
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx] = {
          ...orders[idx],
          payment_status: 'PAID',
          order_status: 'PAID',
          qr_token: qrToken,
          qr_generated_at: paidAt,
          updated_at: paidAt,
          payment: paymentRow
        };
        setLocalTable('orders', orders);

        // Notify Realtime channels of new paid order
        realtimeEmitter.emit('NEW_PAID_ORDER', orders[idx]);
        realtimeEmitter.emit('ORDER_UPDATED', orders[idx]);

        return orders[idx];
      }
      throw new Error('Order not found for payment completion.');
    }
  },

  async getOrders(filter = {}) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), students(*)')
        .order('created_at', { ascending: false });

      if (filter.studentId) query = query.eq('student_id', filter.studentId);
      if (filter.vendorId) query = query.eq('vendor_id', filter.vendorId);
      if (filter.status && filter.status !== 'ALL') query = query.eq('order_status', filter.status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let orders = getLocalTable('orders');
      if (filter.studentId) {
        orders = orders.filter(o => o.student_id === filter.studentId);
      }
      if (filter.status && filter.status !== 'ALL') {
        orders = orders.filter(o => o.order_status === filter.status);
      }
      return orders;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const updates = { order_status: newStatus, updated_at: updatedAt };
      if (newStatus === 'COMPLETED') {
        updates.qr_scanned_at = updatedAt;
      }
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select('*, order_items(*), students(*)')
        .single();
      if (error) throw error;
      return data;
    } else {
      const orders = getLocalTable('orders');
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx] = {
          ...orders[idx],
          order_status: newStatus,
          updated_at: updatedAt,
          ...(newStatus === 'COMPLETED' ? { qr_scanned_at: updatedAt } : {})
        };
        setLocalTable('orders', orders);
        realtimeEmitter.emit('ORDER_UPDATED', orders[idx]);
        return orders[idx];
      }
      throw new Error('Order not found.');
    }
  },

  // --------------------------------------------------------------------------
  // QR CODE VALIDATION & REDEMPTION (VENDOR CAMERA SCANNER)
  // --------------------------------------------------------------------------
  async verifyQRCode({ orderId, qrToken, vendorId }) {
    let order = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), students(*, profiles(*))')
        .eq('id', orderId)
        .single();
      if (error || !data) {
        return { valid: false, reason: 'Order not found in database. The QR code does not correspond to a registered order.' };
      }
      order = data;
    } else {
      const orders = getLocalTable('orders');
      order = orders.find(o => o.id === orderId || o.order_number === orderId);
      if (!order) {
        return { valid: false, reason: 'Order not found in database. The QR code does not correspond to a registered order.' };
      }
    }

    // 1. Token validation
    if (order.qr_token && qrToken && order.qr_token !== qrToken) {
      return { valid: false, reason: 'Invalid security token. This QR code signature is unrecognized.' };
    }

    // 2. Payment validation
    if (order.payment_status !== 'PAID') {
      return { valid: false, reason: `Order payment has not been completed. Current status: ${order.payment_status}` };
    }

    // 3. Vendor validation
    if (vendorId && order.vendor_id && order.vendor_id !== vendorId && vendorId !== DEFAULT_VENDORS[0].id) {
      return { valid: false, reason: 'This order belongs to a different canteen counter bay.' };
    }

    // 4. One-time redemption validation (Prevent Replay / Reuse)
    if (order.order_status === 'COMPLETED' || order.qr_scanned_at) {
      const collectedTime = order.qr_scanned_at ? new Date(order.qr_scanned_at).toLocaleTimeString() : 'Earlier';
      return {
        valid: false,
        isReused: true,
        reason: `FOOD ALREADY COLLECTED! This QR code was redeemed at ${collectedTime}. Cannot be reused.`
      };
    }

    if (order.order_status === 'CANCELLED') {
      return { valid: false, reason: 'This order was CANCELLED or refunded.' };
    }

    // Return verified order details
    const studentInfo = order.students || {
      student_id: '21BCS042',
      college_email: 'rahul.sharma@college.edu',
      full_name: 'Rahul Sharma'
    };

    return {
      valid: true,
      order,
      student: studentInfo,
      items: order.order_items || order.items || []
    };
  },

  async confirmFoodCollection(orderId) {
    return this.updateOrderStatus(orderId, 'COMPLETED');
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
