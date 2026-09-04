import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { playReadyChime, playSuccessChime } from '../utils/audioAlert.js';

const CanteenContext = createContext(null);

export function CanteenProvider({ children }) {
  // Navigation: 'viva' (showcase) | 'student' | 'kitchen' | 'forecast' | 'nlp'
  const [activeView, setActiveView] = useState('viva');
  
  // Data State
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [slotAggregations, setSlotAggregations] = useState({});
  const [maxCapacityPerSlot, setMaxCapacityPerSlot] = useState(6);
  const [simulatedCurrentTime, setSimulatedCurrentTime] = useState('12:00 PM');
  const [forecastData, setForecastData] = useState({ buckets: [], metrics: null });
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Student Cart & Session
  const [cart, setCart] = useState({});
  const [currentStudentOrder, setCurrentStudentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeTabStudent, setActiveTabStudent] = useState('menu'); // 'menu' | 'token' | 'history'

  // Simulated Notification Toast / Modal
  const [notification, setNotification] = useState(null);

  // Fetch initial data
  const fetchAllData = useCallback(async () => {
    try {
      const [menuRes, ordersRes, configRes, forecastRes] = await Promise.all([
        fetch('/api/menu').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/config').then(r => r.json()),
        fetch('/api/forecast').then(r => r.json()),
      ]);

      if (menuRes.success) setMenu(menuRes.menu);
      if (ordersRes.success) {
        setOrders(ordersRes.orders);
        setSlotAggregations(ordersRes.slotAggregations);
      }
      if (configRes.success) {
        setMaxCapacityPerSlot(configRes.maxCapacityPerSlot);
        setSimulatedCurrentTime(configRes.simulatedCurrentTime);
      }
      if (forecastRes.success) {
        setForecastData({ buckets: forecastRes.buckets, metrics: forecastRes.metrics });
      }
    } catch (err) {
      console.error('Error loading canteen data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE Subscription & Polling Fallback
  useEffect(() => {
    fetchAllData();

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

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

            // If this is the current active student's order
            setCurrentStudentOrder(current => {
              if (current && current.id === data.order.id) {
                if (data.order.status === 'ready' && current.status !== 'ready') {
                  playReadyChime();
                  confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                  });
                  // Trigger simulated SMS/WhatsApp alert
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
          console.error('SSE message parse error:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
    }

    // Secondary sync polling every 4s to ensure rock-solid consistency
    const interval = setInterval(fetchAllData, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
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

  // Place Pre-Order
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
        body: JSON.stringify({
          items,
          studentName,
          studentPhone,
          paymentMethod,
          notes,
          source: 'student_app'
        })
      });
      const data = await res.json();
      if (data.success) {
        playSuccessChime();
        setCurrentStudentOrder(data.order);
        setOrderHistory(prev => [data.order, ...prev]);
        clearCart();
        setActiveTabStudent('token');
        return data;
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      throw err;
    }
  };

  // Staff action: update status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
      return data;
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Update capacity setting
  const updateCapacity = async (capacity) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity })
      });
      const data = await res.json();
      if (data.success) {
        setMaxCapacityPerSlot(data.maxCapacityPerSlot);
      }
    } catch (err) {
      console.error('Failed to update capacity:', err);
    }
  };

  // Advance clock (demo feature)
  const advanceClock = async (minutes = 5) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advanceMinutes: minutes })
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedCurrentTime(data.simulatedCurrentTime);
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to advance clock:', err);
    }
  };

  // Simulate lunch rush
  const simulateRush = async () => {
    try {
      const res = await fetch('/api/simulate/rush', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        return data;
      }
    } catch (err) {
      console.error('Failed to simulate rush:', err);
    }
  };

  // Reset demo
  const resetDemo = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        setCart({});
        setCurrentStudentOrder(null);
        setNotification(null);
      }
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  // Walk-in NLP parser call
  const parseNLP = async (text) => {
    try {
      const res = await fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to parse NLP:', err);
      return { success: false, error: err.message };
    }
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
