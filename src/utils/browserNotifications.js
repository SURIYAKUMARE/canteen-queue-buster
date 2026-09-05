/**
 * CampusBite Web Browser Notifications Utility
 * Safely requests permission and notifies students when order states change (e.g. READY for pickup).
 */

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[CampusBite] Notification permission request error:', err);
    return 'denied';
  }
};

export const notifyOrderStatus = (orderNumber, status, canteenName = 'Campus Canteen') => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const normalizedStatus = String(status).toUpperCase();
  let title = `CampusBite Order #${orderNumber}`;
  let body = `Your order status has changed to ${status}.`;

  if (normalizedStatus === 'READY') {
    title = `🎉 Order #${orderNumber} is READY!`;
    body = `Your fresh meal is packed and ready for pickup at ${canteenName}. Bring your QR pass!`;
  } else if (normalizedStatus === 'PREPARING') {
    title = `🍳 Order #${orderNumber} is Cooking!`;
    body = `The kitchen team at ${canteenName} has started preparing your order.`;
  } else if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'COLLECTED') {
    title = `✅ Order #${orderNumber} Collected`;
    body = `Enjoy your meal! Thanks for using CampusBite.`;
  }

  try {
    const notif = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `order-${orderNumber}-${normalizedStatus}`,
      badge: '/favicon.ico',
      requireInteraction: normalizedStatus === 'READY',
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('[CampusBite] Notification trigger error:', err);
    return false;
  }
};
