import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { initialCampusMenu } from '../../server/data/campusMenu.js';
import { initialSeedOrders } from '../../server/data/seedOrders.js';
import { generateOrderQRCode } from '../utils/qrGenerator.js';
import { playReadyChime, playSuccessChime } from '../utils/audioAlert.js';

const CampusContext = createContext(null);

export function CampusProvider({ children }) {
  // Global Role Mode: 'student' | 'vendor' | 'split' (side-by-side demo)
  const [activeRole, setActiveRole] = useState('student');

  // Canteen Operating Status
  const [isCanteenOpen, setIsCanteenOpen] = useState(true);

  // Student Navigation: 'home' | 'menu' | 'orders' | 'qr' | 'profile'
  const [studentTab, setStudentTab] = useState('home');

  // Vendor Navigation: 'dashboard' | 'orders' | 'scan' | 'menu' | 'profile'
  const [vendorTab, setVendorTab] = useState('dashboard');
  const [vendorOrderFilter, setVendorOrderFilter] = useState('ALL');

  // Profiles
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
    id: 'VND-01',
    name: 'Campus Central Kitchen',
    counterBay: 'Bay 1 (Express) & Bay 2 (Hot Meals)',
    email: 'canteen@college.edu',
    operatingHours: '8:00 AM - 6:30 PM',
    isLoggedIn: true
  });

  // Food Menu
  const [menu, setMenu] = useState(initialCampusMenu);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState(null);

  // Cart
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState(initialSeedOrders);
  const [activeStudentOrder, setActiveStudentOrder] = useState(initialSeedOrders[1]); // CB-8492
  const [orderCounter, setOrderCounter] = useState(8494);

  // Live Modals & Popups
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
    },
    {
      id: 'notif-2',
      targetRole: 'vendor',
      title: 'New Order Received',
      message: 'Priya Nair placed order #CB-8493 (₹70)',
      time: '12:02 PM',
      type: 'new_order',
      orderId: 'CB-8493'
    }
  ]);

  // Push notification helper
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

  // Cart Helpers
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
  const cartTotal = cartItemsArray.reduce((acc, it) => acc + (it.food.price * it.quantity), 0);

  // Place Order Flow
  const placeOrder = async ({ paymentMethod = 'Campus RFID Card', notes = '' }) => {
    if (!cartItemsArray.length) return null;

    const orderId = `CB-${orderCounter}`;
    setOrderCounter(c => c + 1);

    const foodItems = cartItemsArray.map(item => ({
      id: item.food.id,
      name: item.food.name,
      price: item.food.price,
      quantity: item.quantity,
      isVeg: item.food.isVeg,
      notes: item.notes
    }));

    const maxPrepTime = Math.max(...cartItemsArray.map(it => it.food.prepTimeMinutes || 5));
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const qrPayload = {
      orderId,
      studentId: studentUser.rollNo,
      studentName: studentUser.name,
      totalAmount: cartTotal,
      itemsCount: cartCount,
      issuedAt: new Date().toISOString(),
      verificationToken: `VFY-${orderId.replace('CB-', '')}-7K`
    };

    const qrCodeImage = await generateOrderQRCode(qrPayload);

    const newOrder = {
      orderId,
      studentId: studentUser.rollNo,
      studentName: studentUser.name,
      studentDept: `${studentUser.dept} • ${studentUser.year}`,
      studentPhone: studentUser.phone,
      foodItems,
      quantities: cartCount,
      totalAmount: cartTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'PENDING',
      createdAt: nowTime,
      estimatedPrepMins: maxPrepTime,
      counterBay: cartCount > 2 ? 'Bay 2 (Hot Meals)' : 'Bay 1 (Express)',
      notes,
      qrCodeData: JSON.stringify(qrPayload),
      qrCodeImage
    };

    // If paid with wallet, deduct student balance
    if (paymentMethod.includes('RFID') || paymentMethod.includes('Wallet')) {
      setStudentUser(prev => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - cartTotal)
      }));
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveStudentOrder(newOrder);
    clearCart();
    setIsCartOpen(false);
    setIsCheckoutOpen(false);

    // Show order success screen for student
    setOrderSuccessModal(newOrder);

    // Add student notification
    addNotification({
      targetRole: 'student',
      title: 'Order Confirmed 🎉',
      message: `Your order #${orderId} was confirmed. Estimated prep: ~${maxPrepTime} mins.`,
      type: 'confirmed',
      orderId
    });

    // Alert vendor with live order popup and chime
    playSuccessChime();
    setLiveVendorOrderPopup(newOrder);
    addNotification({
      targetRole: 'vendor',
      title: '🔔 New Order Received',
      message: `${studentUser.name} placed #${orderId} for ₹${cartTotal}`,
      type: 'new_order',
      orderId
    });

    // Confetti celebration
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    return newOrder;
  };

  // Vendor Action: Accept Order (PENDING -> PREPARING)
  const acceptOrder = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, orderStatus: 'PREPARING', acceptedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return o;
    }));

    setLiveVendorOrderPopup(null);

    // Update active student order if matching
    setActiveStudentOrder(curr => curr?.orderId === orderId ? { ...curr, orderStatus: 'PREPARING' } : curr);

    addNotification({
      targetRole: 'student',
      title: 'Food is being prepared 👨‍🍳',
      message: `Kitchen accepted #${orderId}. Preparing your fresh meal!`,
      type: 'preparing',
      orderId
    });
  };

  // Vendor Action: Reject Order
  const rejectOrder = (orderId, reason = 'Item out of stock') => {
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, orderStatus: 'CANCELLED', rejectionReason: reason };
      }
      return o;
    }));

    setLiveVendorOrderPopup(null);

    addNotification({
      targetRole: 'student',
      title: 'Order Cancelled',
      message: `Order #${orderId} could not be fulfilled: ${reason}. Refund processed.`,
      type: 'cancelled',
      orderId
    });
  };

  // Vendor Action: Mark Order Ready (PREPARING -> READY)
  const markOrderReady = (orderId) => {
    const readyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, orderStatus: 'READY', readyAt: readyTime };
      }
      return o;
    }));

    setActiveStudentOrder(curr => {
      if (curr?.orderId === orderId) {
        playReadyChime();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        return { ...curr, orderStatus: 'READY', readyAt: readyTime };
      }
      return curr;
    });

    addNotification({
      targetRole: 'student',
      title: 'Food is Ready for Pickup! 🔔',
      message: `Order #${orderId} is packed and ready at the pickup bay. Please show your QR code!`,
      type: 'ready',
      orderId
    });
  };

  // Vendor Action: Verify QR & Confirm Pickup (READY -> COMPLETED)
  const verifyQRCode = (scannedDataOrId) => {
    if (!scannedDataOrId) return null;
    let targetId = scannedDataOrId.trim();

    // Try parsing JSON if full QR payload passed
    try {
      if (targetId.startsWith('{')) {
        const parsed = JSON.parse(targetId);
        targetId = parsed.orderId;
      }
    } catch (e) {}

    const order = orders.find(o => o.orderId.toUpperCase() === targetId.toUpperCase());
    return order || null;
  };

  const confirmPickup = (orderId) => {
    const collectedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, orderStatus: 'COMPLETED', collectedAt: collectedTime };
      }
      return o;
    }));

    setActiveStudentOrder(curr => {
      if (curr?.orderId === orderId) {
        playSuccessChime();
        return { ...curr, orderStatus: 'COMPLETED', collectedAt: collectedTime };
      }
      return curr;
    });

    addNotification({
      targetRole: 'student',
      title: 'Food Collected Successfully ✓',
      message: `Enjoy your meal! Order #${orderId} verified and handed over.`,
      type: 'completed',
      orderId
    });

    addNotification({
      targetRole: 'vendor',
      title: 'Pickup Confirmed ✓',
      message: `Order #${orderId} marked as completed.`,
      type: 'completed',
      orderId
    });
  };

  // Menu Management
  const addFoodItem = (foodData) => {
    const newFood = {
      id: `food-${Date.now()}`,
      rating: 4.8,
      available: true,
      tags: ['New Item'],
      ...foodData
    };
    setMenu(prev => [newFood, ...prev]);
  };

  const updateFoodItem = (id, updatedFields) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const deleteFoodItem = (id) => {
    setMenu(prev => prev.filter(item => item.id !== id));
  };

  const toggleFoodAvailability = (id) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  // Canteen Open/Close toggle
  const toggleCanteenStatus = () => {
    setIsCanteenOpen(prev => !prev);
  };

  // Reset Demo State
  const resetAllData = () => {
    setMenu(initialCampusMenu);
    setOrders(initialSeedOrders);
    setActiveStudentOrder(initialSeedOrders[1]);
    setCart({});
    setIsCanteenOpen(true);
    setStudentUser(prev => ({ ...prev, walletBalance: 450 }));
    setLiveVendorOrderPopup(null);
    setOrderSuccessModal(null);
  };

  const value = {
    activeRole,
    setActiveRole,
    isCanteenOpen,
    toggleCanteenStatus,
    studentTab,
    setStudentTab,
    vendorTab,
    setVendorTab,
    vendorOrderFilter,
    setVendorOrderFilter,
    studentUser,
    setStudentUser,
    vendorUser,
    setVendorUser,
    menu,
    selectedFoodDetail,
    setSelectedFoodDetail,
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
    orders,
    activeStudentOrder,
    setActiveStudentOrder,
    placeOrder,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    verifyQRCode,
    confirmPickup,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleFoodAvailability,
    liveVendorOrderPopup,
    setLiveVendorOrderPopup,
    orderSuccessModal,
    setOrderSuccessModal,
    notifications,
    addNotification,
    resetAllData
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
