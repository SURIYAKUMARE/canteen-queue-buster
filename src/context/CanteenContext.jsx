import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { playReadyChime, playSuccessChime } from '../utils/audioAlert.js';
import { initialMenuItems } from '../../server/data/menu.js';
import { initialForecastBuckets, computeForecastMetrics } from '../../server/data/historicalForecast.js';
import { assignPickupSlot, formatMinutesToSlotTime, generateSlots } from '../../server/utils/scheduler.js';
import { parseNaturalLanguageOrder } from '../../server/utils/nlpParser.js';

const CanteenContext = createContext(null);

const initialOrdersSeed = [
  {
    id: 'ord-101',
    tokenNumber: 'TK-101',
    studentName: 'Rohan Sharma',
    studentPhone: '+91 98765 43210',
    items: [
      { id: 'item-1', name: 'Veg Thali Deluxe', quantity: 1, price: 80, emoji: '🍱', modifiers: ['No Onion/Garlic'] },
      { id: 'item-9', name: 'Kulhad Masala Chai', quantity: 1, price: 15, emoji: '☕', modifiers: ['Less / No Sugar'] }
    ],
    totalItems: 2,
    totalAmount: 95,
    paymentMethod: 'Campus RFID Wallet',
    paymentStatus: 'PAID',
    pickupSlot: '12:05 PM',
    status: 'ready',
    notes: 'Please pack chai in thermal takeaway lid',
    counterBay: 'Bay 1',
    placedAt: '11:58 AM',
    readyAt: '12:04 PM',
    source: 'app'
  },
  {
    id: 'ord-102',
    tokenNumber: 'TK-102',
    studentName: 'Ananya Iyer',
    studentPhone: '+91 98123 45678',
    items: [
      { id: 'item-3', name: 'Crispy Masala Dosa', quantity: 2, price: 55, emoji: '🥞', modifiers: ['Extra Chutney'] },
      { id: 'item-10', name: 'Cold Coffee with Ice Cream', quantity: 1, price: 45, emoji: '🥤', modifiers: [] }
    ],
    totalItems: 3,
    totalAmount: 155,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    pickupSlot: '12:10 PM',
    status: 'preparing',
    notes: 'Extra crispy dosa please',
    counterBay: 'Bay 2',
    placedAt: '12:01 PM',
    source: 'app'
  },
  {
    id: 'ord-103',
    tokenNumber: 'TK-103',
    studentName: 'Arjun Verma',
    studentPhone: '+91 97234 56789',
    items: [
      { id: 'item-4', name: 'Chole Bhature (2 Pcs)', quantity: 1, price: 70, emoji: '🫓', modifiers: [] },
      { id: 'item-7', name: 'Butter Pav Bhaji', quantity: 1, price: 65, emoji: '🥘', modifiers: ['Extra Butter'] }
    ],
    totalItems: 2,
    totalAmount: 135,
    paymentMethod: 'UPI (Paytm)',
    paymentStatus: 'PAID',
    pickupSlot: '12:10 PM',
    status: 'confirmed',
    notes: '',
    counterBay: 'Bay 1',
    placedAt: '12:03 PM',
    source: 'app'
  }
];

function buildSlotAggregations(currentOrders, capacity = 6, baseMins = 720) {
  const active = (currentOrders || []).filter(o => o.status !== 'cancelled' && o.status !== 'completed');
  const slotMap = {};
  const slots = generateSlots(baseMins, 10);

  slots.forEach(s => {
    slotMap[s] = { slotTime: s, orders: [], totalItems: 0, itemCounts: {}, isFull: false, capacityPct: 0 };
  });

  active.forEach(ord => {
    const slot = ord.pickupSlot;
    if (!slotMap[slot]) {
      slotMap[slot] = { slotTime: slot, orders: [], totalItems: 0, itemCounts: {}, isFull: false, capacityPct: 0 };
    }
    slotMap[slot].orders.push(ord);
    slotMap[slot].totalItems += ord.totalItems || 1;
    (ord.items || []).forEach(it => {
      slotMap[slot].itemCounts[it.name] = (slotMap[slot].itemCounts[it.name] || 0) + (it.quantity || 1);
    });
  });

  Object.values(slotMap).forEach(s => {
    s.capacityPct = Math.min(100, Math.round((s.totalItems / capacity) * 100));
    s.isFull = s.totalItems >= capacity;
  });

  return slotMap;
}

export function CanteenProvider({ children }) {
  // Navigation: 'viva' (showcase) | 'student' | 'kitchen' | 'forecast' | 'nlp'
  const [activeView, setActiveView] = useState('viva');
  
  // Data State - Pre-seeded with rich defaults so it NEVER renders blank on static deploys
  const [menu, setMenu] = useState(initialMenuItems);
  const [orders, setOrders] = useState(initialOrdersSeed);
  const [maxCapacityPerSlot, setMaxCapacityPerSlot] = useState(6);
  const [baseMins, setBaseMins] = useState(12 * 60);
  const [simulatedCurrentTime, setSimulatedCurrentTime] = useState('12:00 PM');
  const [forecastData, setForecastData] = useState({
    buckets: initialForecastBuckets,
    metrics: computeForecastMetrics(initialForecastBuckets)
  });
  const [slotAggregations, setSlotAggregations] = useState(() => buildSlotAggregations(initialOrdersSeed, 6, 720));
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [tokenCounter, setTokenCounter] = useState(104);

  // Student Cart & Session
  const [cart, setCart] = useState({});
  const [currentStudentOrder, setCurrentStudentOrder] = useState(initialOrdersSeed[0]);
  const [orderHistory, setOrderHistory] = useState(initialOrdersSeed);
  const [activeTabStudent, setActiveTabStudent] = useState('menu'); // 'menu' | 'token' | 'history'

  // Simulated Notification Toast / Modal
  const [notification, setNotification] = useState(null);

  // Recompute slot aggregations when orders, capacity, or clock changes
  const refreshLocalAggregations = useCallback((ords = orders, cap = maxCapacityPerSlot, mins = baseMins) => {
    setSlotAggregations(buildSlotAggregations(ords, cap, mins));
  }, [orders, maxCapacityPerSlot, baseMins]);

  // Try fetching from backend if available (hybrid mode)
  const fetchAllData = useCallback(async () => {
    try {
      const [menuRes, ordersRes, configRes, forecastRes] = await Promise.all([
        fetch('/api/menu').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/orders').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/config').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/forecast').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      if (menuRes?.success) setMenu(menuRes.menu);
      if (ordersRes?.success) {
        setOrders(ordersRes.orders);
        setSlotAggregations(ordersRes.slotAggregations);
      }
      if (configRes?.success) {
        setMaxCapacityPerSlot(configRes.maxCapacityPerSlot);
        setSimulatedCurrentTime(configRes.simulatedCurrentTime);
      }
      if (forecastRes?.success) {
        setForecastData({ buckets: forecastRes.buckets, metrics: forecastRes.metrics });
      }
      if (menuRes || ordersRes) {
        setIsConnected(true);
      }
    } catch (err) {
      // Backend not present - keep running seamlessly in client state
      setIsConnected(false);
    }
  }, []);

  // SSE Subscription & Polling Fallback
  useEffect(() => {
    fetchAllData();

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => setIsConnected(true);

      eventSource.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          const { type, data } = message;

          if (type === 'ORDER_CREATED') {
            setOrders(prev => {
              const exists = prev.some(o => o.id === data.order.id);
              return exists ? prev : [data.order, ...prev];
            });
            if (data.slotAggregations) setSlotAggregations(data.slotAggregations);
          } else if (type === 'ORDER_STATUS_CHANGED') {
            setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
            if (data.slotAggregations) setSlotAggregations(data.slotAggregations);

            setCurrentStudentOrder(current => {
              if (current && current.id === data.order.id) {
                if (data.order.status === 'ready' && current.status !== 'ready') {
                  playReadyChime();
                  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                  setNotification({
                    type: 'READY_ALERT',
                    token: data.order.tokenNumber,
                    slot: data.order.pickupSlot,
                    bay: data.order.counterBay || 'Bay 1',
                    phone: data.order.studentPhone,
                    text: `🔔 Smart Canteen: Token ${data.order.tokenNumber} is READY at ${data.order.counterBay || 'Bay 1'}. Pick up your order now!`
                  });
                }
                return data.order;
              }
              return current;
            });
          } else if (type === 'CONFIG_UPDATED') {
            if (data.maxCapacityPerSlot) setMaxCapacityPerSlot(data.maxCapacityPerSlot);
            if (data.simulatedCurrentTime) setSimulatedCurrentTime(data.simulatedCurrentTime);
          } else if (type === 'RUSH_SIMULATED') {
            fetchAllData();
          } else if (type === 'SYSTEM_RESET') {
            fetchAllData();
            setCurrentStudentOrder(null);
          }
        } catch (err) {
          console.warn('SSE message parse:', err);
        }
      };

      eventSource.onerror = () => setIsConnected(false);
    } catch (e) {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchAllData]);

  // Cart operations
  const addToCart = (item, customModifiers = []) => {
    setCart(prev => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: {
            ...existing,
            quantity: existing.quantity + 1,
            modifiers: customModifiers.length ? customModifiers : existing.modifiers
          }
        };
      }
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: 1,
          modifiers: customModifiers,
          notes: ''
        }
      };
    });
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart(prev => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: newQty }
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const totalCartItems = Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0);
  const cartSubtotal = Object.values(cart).reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  // Place Pre-Order (with client-side fallback if backend API is unavailable)
  const placeOrder = async ({ studentName = 'Student', studentPhone = '+91 98765 43210', paymentMethod = 'Campus RFID Wallet', notes = '' }) => {
    const items = Object.values(cart).map(entry => ({
      id: entry.item.id,
      name: entry.item.name,
      price: entry.item.price,
      emoji: entry.item.emoji,
      quantity: entry.quantity,
      modifiers: entry.modifiers || []
    }));

    if (!items.length) return null;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, studentName, studentPhone, paymentMethod, notes, source: 'student_app' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          playSuccessChime();
          setCurrentStudentOrder(data.order);
          setOrderHistory(prev => [data.order, ...prev]);
          clearCart();
          setActiveTabStudent('token');
          return data;
        }
      }
    } catch (e) {
      // Fallback to client-side scheduling
    }

    // Client-side fallback order creation
    const totalItems = items.reduce((s, it) => s + (it.quantity || 1), 0);
    const totalAmount = items.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);

    const slotAssignment = assignPickupSlot({
      existingOrders: orders,
      orderItemCount: totalItems,
      maxCapacityPerSlot,
      baseMinutes: baseMins,
      minPrepMinutes: 5
    });

    const newOrder = {
      id: `ord-${tokenCounter}`,
      tokenNumber: `TK-${tokenCounter}`,
      studentName,
      studentPhone,
      items,
      totalItems,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PAID',
      pickupSlot: slotAssignment.assignedSlot,
      status: 'confirmed',
      notes,
      counterBay: totalItems > 3 ? 'Bay 2 (Bulk)' : 'Bay 1 (Express)',
      placedAt: formatMinutesToSlotTime(baseMins),
      schedulingInfo: slotAssignment,
      source: 'student_app'
    };

    setTokenCounter(c => c + 1);
    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    setCurrentStudentOrder(newOrder);
    setOrderHistory(prev => [newOrder, ...prev]);
    setSlotAggregations(buildSlotAggregations(nextOrders, maxCapacityPerSlot, baseMins));

    playSuccessChime();
    clearCart();
    setActiveTabStudent('token');
    return { success: true, order: newOrder, slotScheduling: slotAssignment };
  };

  // Staff action: update status (with client-side fallback)
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
          return data;
        }
      }
    } catch (e) {
      // Fallback to client
    }

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId || o.tokenNumber === orderId) {
          const mod = { ...o, status };
          if (status === 'ready') mod.readyAt = formatMinutesToSlotTime(baseMins);
          if (status === 'completed') mod.completedAt = formatMinutesToSlotTime(baseMins);

          if (currentStudentOrder && (currentStudentOrder.id === o.id || currentStudentOrder.tokenNumber === o.tokenNumber)) {
            setCurrentStudentOrder(mod);
            if (status === 'ready') {
              playReadyChime();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              setNotification({
                type: 'READY_ALERT',
                token: mod.tokenNumber,
                slot: mod.pickupSlot,
                bay: mod.counterBay || 'Bay 1',
                phone: mod.studentPhone,
                text: `🔔 Smart Canteen: Token ${mod.tokenNumber} is READY at ${mod.counterBay || 'Bay 1'}. Pick up your order now!`
              });
            }
          }
          return mod;
        }
        return o;
      });
      setSlotAggregations(buildSlotAggregations(updated, maxCapacityPerSlot, baseMins));
      return updated;
    });
  };

  // Update capacity setting
  const updateCapacity = async (capacity) => {
    setMaxCapacityPerSlot(capacity);
    setSlotAggregations(buildSlotAggregations(orders, capacity, baseMins));
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity })
      });
    } catch (e) {}
  };

  // Advance clock
  const advanceClock = async (minutes = 5) => {
    const nextMins = baseMins + minutes;
    setBaseMins(nextMins);
    const nextTime = formatMinutesToSlotTime(nextMins);
    setSimulatedCurrentTime(nextTime);
    setSlotAggregations(buildSlotAggregations(orders, maxCapacityPerSlot, nextMins));

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advanceMinutes: minutes })
      });
    } catch (e) {}
  };

  // Simulate lunch rush (with client-side fallback)
  const simulateRush = async () => {
    try {
      const res = await fetch('/api/simulate/rush', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchAllData();
          return data;
        }
      }
    } catch (e) {}

    // Client-side rush generator
    const sampleStudents = ['Priya Nair', 'Vikram Patel', 'Siddharth Roy', 'Sneha Kulkarni'];
    let runningOrders = [...orders];
    let currentCounter = tokenCounter;

    for (let i = 0; i < 4; i++) {
      const student = sampleStudents[i % sampleStudents.length];
      const m1 = menu[Math.floor(Math.random() * 4)];
      const m2 = menu[8 + (i % 2)];
      const items = [
        { id: m1.id, name: m1.name, price: m1.price, emoji: m1.emoji, quantity: 1, modifiers: [] },
        { id: m2.id, name: m2.name, price: m2.price, emoji: m2.emoji, quantity: 1, modifiers: [] }
      ];
      const totalItems = 2;
      const totalAmount = m1.price + m2.price;

      const slotAssignment = assignPickupSlot({
        existingOrders: runningOrders,
        orderItemCount: totalItems,
        maxCapacityPerSlot,
        baseMinutes: baseMins,
        minPrepMinutes: 5
      });

      const newOrder = {
        id: `ord-${currentCounter}`,
        tokenNumber: `TK-${currentCounter++}`,
        studentName: student,
        studentPhone: `+91 99000 ${1000 + i}`,
        items,
        totalItems,
        totalAmount,
        paymentMethod: 'Campus RFID Wallet',
        paymentStatus: 'PAID',
        pickupSlot: slotAssignment.assignedSlot,
        status: 'confirmed',
        notes: 'Rush-hour simulated order',
        counterBay: 'Bay 1',
        placedAt: formatMinutesToSlotTime(baseMins),
        schedulingInfo: slotAssignment,
        source: 'simulated_rush'
      };

      runningOrders = [newOrder, ...runningOrders];
    }

    setTokenCounter(currentCounter);
    setOrders(runningOrders);
    setSlotAggregations(buildSlotAggregations(runningOrders, maxCapacityPerSlot, baseMins));
  };

  // Reset demo (with client-side fallback)
  const resetDemo = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {}

    setOrders(initialOrdersSeed);
    setMaxCapacityPerSlot(6);
    setBaseMins(720);
    setSimulatedCurrentTime('12:00 PM');
    setTokenCounter(104);
    setCart({});
    setCurrentStudentOrder(initialOrdersSeed[0]);
    setNotification(null);
    setSlotAggregations(buildSlotAggregations(initialOrdersSeed, 6, 720));
  };

  // Walk-in NLP parser (with client-side fallback)
  const parseNLP = async (text) => {
    try {
      const res = await fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (e) {}

    // Client-side fallback NLP parsing
    const result = parseNaturalLanguageOrder(text, menu);
    return { success: true, result };
  };

  const value = {
    activeView,
    setActiveView,
    menu,
    orders,
    slotAggregations,
    maxCapacityPerSlot,
    simulatedCurrentTime,
    forecastData,
    loading,
    isConnected,
    cart,
    totalCartItems,
    cartSubtotal,
    currentStudentOrder,
    setCurrentStudentOrder,
    orderHistory,
    activeTabStudent,
    setActiveTabStudent,
    notification,
    setNotification,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    updateOrderStatus,
    updateCapacity,
    advanceClock,
    simulateRush,
    resetDemo,
    parseNLP,
    refreshData: fetchAllData
  };

  return (
    <CanteenContext.Provider value={value}>
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
}
