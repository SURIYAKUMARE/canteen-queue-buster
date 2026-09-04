import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { databaseService } from '../lib/databaseService.js';
import { subscribeToOrders, subscribeToFoodItems } from '../lib/realtimeService.js';
import { generateOrderQRCode } from '../utils/qrGenerator.js';
import { playReadyChime, playSuccessChime } from '../utils/audioAlert.js';
import { isSupabaseConfigured } from '../lib/supabaseClient.js';

const CampusContext = createContext(null);

export function CampusProvider({ children }) {
  // Global Role Mode: 'student' | 'vendor' | 'split' (side-by-side presentation)
  const [activeRole, setActiveRole] = useState('student');

  // Canteen Operating Status
  const [isCanteenOpen, setIsCanteenOpen] = useState(true);

  // Student Navigation: 'home' | 'menu' | 'orders' | 'qr' | 'profile'
  const [studentTab, setStudentTab] = useState('home');

  // Vendor Navigation: 'dashboard' | 'orders' | 'scan' | 'menu' | 'profile'
  const [vendorTab, setVendorTab] = useState('dashboard');
  const [vendorOrderFilter, setVendorOrderFilter] = useState('ALL');

  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState({
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@college.edu',
      phone: '+91 98765 43210',
      role: 'student'
    },
    student: {
      id: '22222222-2222-2222-2222-222222222222',
      student_id: '21BCS042',
      college_email: 'rahul.sharma@college.edu',
      phone: '+91 98765 43210'
    }
  });

  const [studentUser, setStudentUser] = useState({
    id: 'STU-2024-8842',
    name: 'Rahul Sharma',
    rollNo: '21BCS042',
    dept: 'Computer Science',
    year: '3rd Year',
    email: 'rahul.sharma@college.edu',
    phone: '+91 98765 43210',
    walletBalance: 450,
    isLoggedIn: true
  });

  const [vendorUser, setVendorUser] = useState({
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Campus Central Kitchen',
    counterBay: 'Bay 1 (Express) & Bay 2 (Hot Meals)',
    email: 'canteen@college.edu',
    operatingHours: '8:00 AM - 6:30 PM',
    isLoggedIn: true
  });

  // Food Menu
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState(null);

  // Cart
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeStudentOrder, setActiveStudentOrder] = useState(null);

  // Payment Checkout
  const [pendingCheckoutOrder, setPendingCheckoutOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Modals & UI Controls
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState('student');
  const [supabaseConfigModalOpen, setSupabaseConfigModalOpen] = useState(false);
  const [liveVendorOrderPopup, setLiveVendorOrderPopup] = useState(null);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      targetRole: 'student',
      title: 'Order Status Update',
      message: 'Your order #CB-8491 is READY for pickup at Bay 1!',
      time: '11:54 AM',
      type: 'ready',
      orderId: 'CB-8491'
    }
  ]);

  // Load Menu and Orders from Database
  const fetchMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      const items = await databaseService.getFoodItems();
      setMenu(items || []);
    } catch (err) {
      console.error('Failed to fetch food items:', err);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const list = await databaseService.getOrders();
      setOrders(list || []);
      // Set active student order if not set
      if (list && list.length > 0) {
        const studentOrders = list.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED');
        if (studentOrders.length > 0) {
          setActiveStudentOrder(studentOrders[0]);
        } else {
          setActiveStudentOrder(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, [fetchMenu, fetchOrders]);

  // Setup Realtime Subscriptions
  useEffect(() => {
    const unsubOrders = subscribeToOrders({
      onNewOrder: (newOrder) => {
        // Vendor live alert popup
        setLiveVendorOrderPopup(newOrder);
        playSuccessChime();

        // Add vendor notification
        addNotification({
          targetRole: 'vendor',
          title: '🔔 NEW ORDER RECEIVED',
          message: `Order #${newOrder.order_number} received for ₹${newOrder.total_amount}.`,
          type: 'new_order',
          orderId: newOrder.order_number
        });

        // Update orders list
        setOrders(prev => {
          const exists = prev.some(o => o.id === newOrder.id);
          if (exists) {
            return prev.map(o => o.id === newOrder.id ? { ...o, ...newOrder } : o);
          }
          return [newOrder, ...prev];
        });
      },
      onOrderUpdate: (updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));

        // Update active student order
        setActiveStudentOrder(curr => {
          if (curr?.id === updatedOrder.id) {
            if (updatedOrder.order_status === 'READY') {
              playReadyChime();
              confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
            }
            return { ...curr, ...updatedOrder };
          }
          return curr;
        });
      }
    });

    const unsubMenu = subscribeToFoodItems(() => {
      fetchMenu();
    });

    return () => {
      unsubOrders();
      unsubMenu();
    };
  }, [fetchMenu]);

  // Notifications helper
  const addNotification = useCallback(({ targetRole, title, message, type = 'info', orderId = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      targetRole,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      orderId
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Cart Operations
  const addToCart = (food, quantity = 1, notes = '') => {
    setCart(prev => {
      const existing = prev[food.id];
      if (existing) {
        return {
          ...prev,
          [food.id]: {
            ...existing,
            quantity: existing.quantity + quantity,
            notes: notes || existing.notes
          }
        };
      }
      return {
        ...prev,
        [food.id]: {
          food,
          quantity,
          notes
        }
      };
    });
    playSuccessChime();
  };

  const updateCartQty = (foodId, delta) => {
    setCart(prev => {
      const existing = prev[foodId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return {
        ...prev,
        [foodId]: { ...existing, quantity: newQty }
      };
    });
  };

  const removeFromCart = (foodId) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[foodId];
      return copy;
    });
  };

  const clearCart = () => setCart({});

  const cartItemsArray = Object.values(cart);
  const cartCount = cartItemsArray.reduce((acc, it) => acc + it.quantity, 0);
  const cartTotal = cartItemsArray.reduce((acc, it) => acc + ((Number(it.food.price) || 0) * it.quantity), 0);

  // Initiate Checkout Flow: Creates PENDING_PAYMENT order and opens Payment Modal
  const initiateCheckout = async ({ notes = '' } = {}) => {
    if (!cartItemsArray.length) {
      alert('Your cart is empty. Add food items before checkout.');
      return;
    }

    try {
      const orderItems = cartItemsArray.map(item => ({
        id: item.food.id,
        name: item.food.name,
        price: item.food.price,
        quantity: item.quantity,
        notes: item.notes
      }));

      // Create Order in Supabase with PENDING status
      const createdOrder = await databaseService.createPendingOrder({
        studentId: currentUser?.student?.id || studentUser.id,
        vendorId: vendorUser.id,
        items: orderItems,
        subtotal: cartTotal,
        totalAmount: cartTotal,
        notes
      });

      setPendingCheckoutOrder(createdOrder);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setIsPaymentModalOpen(true);
      return createdOrder;
    } catch (err) {
      console.error('Failed to initiate checkout:', err);
      alert('Checkout error: ' + (err.message || 'Unable to place pending order.'));
    }
  };

  // Called after payment authorization completes
  const handlePaymentCompleted = (confirmedOrder) => {
    clearCart();
    setIsPaymentModalOpen(false);
    setPendingCheckoutOrder(null);
    setActiveStudentOrder(confirmedOrder);
    setOrderSuccessModal(confirmedOrder);
    fetchOrders();
  };

  // Vendor Action: Accept Order (PAID -> ACCEPTED)
  const acceptOrder = async (orderId) => {
    try {
      const updated = await databaseService.updateOrderStatus(orderId, 'ACCEPTED');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      setLiveVendorOrderPopup(null);

      addNotification({
        targetRole: 'student',
        title: 'Order Accepted 👨‍🍳',
        message: `Kitchen accepted order #${updated.order_number || orderId}. Starting preparation shortly.`,
        type: 'accepted',
        orderId: updated.order_number
      });
    } catch (err) {
      alert('Failed to accept order: ' + err.message);
    }
  };

  // Vendor Action: Start Prep (ACCEPTED -> PREPARING)
  const startPrepOrder = async (orderId) => {
    try {
      const updated = await databaseService.updateOrderStatus(orderId, 'PREPARING');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));

      addNotification({
        targetRole: 'student',
        title: 'Food is Being Prepared 🍳',
        message: `Your meal #${updated.order_number || orderId} is sizzling on the stove!`,
        type: 'preparing',
        orderId: updated.order_number
      });
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Vendor Action: Reject Order
  const rejectOrder = async (orderId, reason = 'Item sold out') => {
    try {
      const updated = await databaseService.updateOrderStatus(orderId, 'CANCELLED');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      setLiveVendorOrderPopup(null);

      addNotification({
        targetRole: 'student',
        title: 'Order Cancelled',
        message: `Order #${updated.order_number || orderId} could not be fulfilled: ${reason}. Refund initiated.`,
        type: 'cancelled',
        orderId: updated.order_number
      });
    } catch (err) {
      alert('Failed to reject order: ' + err.message);
    }
  };

  // Vendor Action: Mark Order Ready (PREPARING -> READY)
  const markOrderReady = async (orderId) => {
    try {
      const updated = await databaseService.updateOrderStatus(orderId, 'READY');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));

      playReadyChime();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });

      addNotification({
        targetRole: 'student',
        title: 'Food is Ready for Pickup! 🔔',
        message: `Order #${updated.order_number || orderId} is packed. Head to counter bay and show your QR code!`,
        type: 'ready',
        orderId: updated.order_number
      });
    } catch (err) {
      alert('Failed to mark ready: ' + err.message);
    }
  };

  // Vendor Action: Menu Management
  const addFoodItem = async (foodData) => {
    try {
      const created = await databaseService.addFoodItem(foodData, vendorUser.id);
      setMenu(prev => [created, ...prev]);
      return created;
    } catch (err) {
      alert('Failed to add food item: ' + err.message);
    }
  };

  const updateFoodItem = async (id, updatedFields) => {
    try {
      const updated = await databaseService.updateFoodItem(id, updatedFields);
      setMenu(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      return updated;
    } catch (err) {
      alert('Failed to update food item: ' + err.message);
    }
  };

  const deleteFoodItem = async (id) => {
    try {
      await databaseService.deleteFoodItem(id);
      setMenu(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to delete food item: ' + err.message);
    }
  };

  const toggleFoodAvailability = async (id) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const newStatus = !item.is_available;
    try {
      const updated = await databaseService.updateFoodItem(id, { is_available: newStatus });
      setMenu(prev => prev.map(m => m.id === id ? { ...m, is_available: newStatus } : m));
    } catch (err) {
      alert('Failed to toggle availability: ' + err.message);
    }
  };

  const toggleCanteenStatus = () => {
    setIsCanteenOpen(prev => !prev);
  };

  // Role switching with authorization checks
  const handleRoleSwitch = (newRole) => {
    if (newRole === 'student' || newRole === 'vendor' || newRole === 'split') {
      setActiveRole(newRole);
    }
  };

  const openAuthModal = (roleToAuth = 'student') => {
    setAuthModalInitialRole(roleToAuth);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await databaseService.signOut();
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const value = {
    // Role & Navigation
    activeRole,
    setActiveRole: handleRoleSwitch,
    isCanteenOpen,
    toggleCanteenStatus,
    studentTab,
    setStudentTab,
    vendorTab,
    setVendorTab,
    vendorOrderFilter,
    setVendorOrderFilter,

    // Auth & Profiles
    currentUser,
    setCurrentUser,
    studentUser,
    setStudentUser,
    vendorUser,
    setVendorUser,
    openAuthModal,
    handleLogout,
    authModalOpen,
    setAuthModalOpen,
    authModalInitialRole,

    // Supabase config
    supabaseConfigModalOpen,
    setSupabaseConfigModalOpen,

    // Menu
    menu,
    menuLoading,
    fetchMenu,
    selectedFoodDetail,
    setSelectedFoodDetail,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleFoodAvailability,

    // Cart
    cart,
    cartItemsArray,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,

    // Checkout & Payment
    initiateCheckout,
    pendingCheckoutOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    handlePaymentCompleted,

    // Orders
    orders,
    ordersLoading,
    refreshOrders: fetchOrders,
    activeStudentOrder,
    setActiveStudentOrder,
    acceptOrder,
    startPrepOrder,
    rejectOrder,
    markOrderReady,

    // Modals
    liveVendorOrderPopup,
    setLiveVendorOrderPopup,
    orderSuccessModal,
    setOrderSuccessModal,

    // Notifications
    notifications,
    addNotification
  };

  return (
    <CampusContext.Provider value={value}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used within CampusProvider');
  return ctx;
}
