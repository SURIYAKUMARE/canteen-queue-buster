import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ChefHat, 
  ArrowRight, 
  RotateCcw, 
  ShoppingBag, 
  Bell, 
  Users, 
  Flame, 
  Sparkles 
} from 'lucide-react';
import { Button, Badge, EmptyState } from './ui';
import { useToast } from './ui/ToastContext';
import { requestNotificationPermission, isNotificationSupported } from '../utils/browserNotifications';

export default function StudentOrders() {
  const { 
    orders, 
    setActiveStudentOrder, 
    setStudentTab, 
    currentUser, 
    studentUser, 
    addToCart, 
    setIsCartOpen 
  } = useCampus();
  const { toast } = useToast();
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const currentStudentId = currentUser?.student?.id || studentUser.id;
  const currentRollNo = currentUser?.student?.student_id || studentUser.rollNo;

  // Filter orders strictly for current logged-in student
  const studentOrders = orders.filter(o => {
    const sId = o.student_id || o.studentId;
    return sId === currentStudentId || sId === currentRollNo;
  });

  const trackingSteps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received in kitchen queue' },
    { key: 'PAID', label: 'Payment Confirmed', desc: 'Secure verified transaction' },
    { key: 'ACCEPTED', label: 'Order Accepted', desc: 'Kitchen acknowledged order' },
    { key: 'PREPARING', label: 'Preparing Fresh', desc: 'Cooking meal at counter bay' },
    { key: 'READY', label: 'Ready for Pickup', desc: 'Packed and waiting for you!' },
    { key: 'COMPLETED', label: 'Picked Up', desc: 'QR scanned & order fulfilled' },
  ];

  const getStepProgressIndex = (status) => {
    switch (String(status).toUpperCase()) {
      case 'PENDING_PAYMENT': return 1;
      case 'PAID': return 2;
      case 'ACCEPTED': return 3;
      case 'PREPARING': return 4;
      case 'READY': return 5;
      case 'COMPLETED':
      case 'COLLECTED': return 6;
      default: return 2;
    }
  };

  const activeOrder = studentOrders.find(o => {
    const st = (o.order_status || o.orderStatus || '').toUpperCase();
    return !['COMPLETED', 'COLLECTED', 'CANCELLED'].includes(st);
  }) || studentOrders[0];

  const activeOrderStatus = activeOrder ? (activeOrder.order_status || activeOrder.orderStatus || '').toUpperCase() : '';
  const isActive = activeOrder && !['COMPLETED', 'COLLECTED', 'CANCELLED'].includes(activeOrderStatus);

  // Calculate live queue position ahead of active order
  const activeOrderCreated = new Date(activeOrder?.created_at || activeOrder?.createdAt || Date.now()).getTime();
  const queueAhead = isActive ? orders.filter(o => {
    const st = (o.order_status || o.orderStatus || '').toUpperCase();
    if (!['PAID', 'ACCEPTED', 'PREPARING'].includes(st)) return false;
    const oVendor = o.vendor_id || o.vendorId;
    const activeVendor = activeOrder?.vendor_id || activeOrder?.vendorId;
    if (activeVendor && oVendor && activeVendor !== oVendor) return false;
    const oCreated = new Date(o.created_at || o.createdAt || 0).getTime();
    return oCreated < activeOrderCreated;
  }).length : 0;

  const positionInQueue = queueAhead + 1;
  const estimatedWaitMins = Math.max(2, positionInQueue * 4);

  // 1-Tap Reorder handler
  const handleReorder = (order) => {
    const items = order.order_items || order.items || order.foodItems || [];
    if (!items.length) {
      toast.warning('No items found in this order receipt.');
      return;
    }

    items.forEach(it => {
      const foodItem = {
        id: it.food_id || it.foodId || it.id,
        name: it.food_name_snapshot || it.name || 'Canteen Item',
        price: Number(it.price_snapshot || it.price || 0),
        image: it.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300'
      };
      const qty = Number(it.quantity || 1);
      for (let i = 0; i < qty; i++) {
        addToCart(foodItem);
      }
    });

    toast.success(`Re-added ${items.length} item(s) to your cart! 🛒`);
    setIsCartOpen(true);
  };

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      setNotifGranted(true);
      toast.success('Pickup notifications enabled! We will ping you when ready.');
    } else {
      toast.info('Notifications not enabled.');
    }
  };

  if (studentOrders.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-5 pb-20 px-4 text-white animate-fadeIn">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>📦 My Orders & Live Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time status updates powered by Supabase Realtime</p>
        </div>

        <EmptyState
          icon={ShoppingBag}
          title="No orders placed yet"
          description="Explore our campus kitchen menu and pre-order fresh meals to beat the canteen rush!"
          action={
            <Button variant="primary" onClick={() => setStudentTab('menu')}>
              Browse Menu & Order
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 pb-20 px-4 text-white animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>📦 My Orders & Live Tracking</span>
        </h2>
        <p className="text-xs text-slate-400">Real-time status updates powered by Supabase Realtime</p>
      </div>

      {/* Active Order Live Tracker */}
      {activeOrder && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIVE ORDER STATUS</span>
              <div className="text-xl font-black font-mono text-white">#{activeOrder.order_number || activeOrder.orderId}</div>
            </div>
            <button
              onClick={() => {
                setActiveStudentOrder(activeOrder);
                setStudentTab('qr');
              }}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition font-mono active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </button>
          </div>

          {/* Live Queue Position Banner */}
          {isActive && (
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  {activeOrderStatus === 'READY' ? (
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-bounce" />
                  ) : (
                    <Users className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {activeOrderStatus === 'READY' ? (
                      <span className="text-emerald-400 font-extrabold">🎉 READY FOR PICKUP!</span>
                    ) : (
                      <>
                        <span>Queue Position:</span>
                        <span className="font-mono text-amber-400 font-black">#{positionInQueue} in line</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeOrderStatus === 'READY'
                      ? 'Head to Counter Bay with your QR Pass'
                      : `Estimated wait: ~${estimatedWaitMins} mins`}
                  </div>
                </div>
              </div>

              {/* Notification opt-in prompt if not already enabled */}
              {!notifGranted && isNotificationSupported() && (
                <button
                  onClick={handleEnableNotifications}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0"
                  title="Notify me when ready"
                >
                  <Bell className="w-3 h-3" />
                  <span>Notify Me</span>
                </button>
              )}
            </div>
          )}

          {/* Stepper Timeline */}
          <div className="py-2 space-y-3.5">
            {trackingSteps.map((step, idx) => {
              const currentProgress = getStepProgressIndex(activeOrderStatus);
              const isDone = currentProgress > idx;
              const isCurrent = currentProgress === idx + 1;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Vertical connector line */}
                  {idx < trackingSteps.length - 1 && (
                    <div 
                      className={`absolute left-3.5 top-6 w-0.5 h-8 transition-colors ${
                        isDone ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    />
                  )}

                  {/* Node icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-all z-10 ${
                      isDone
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Items */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-amber-400 text-sm font-mono">
              ₹{Number(activeOrder.total_amount || activeOrder.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Past Orders History List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Order Receipts ({studentOrders.length})
        </h3>

        <div className="space-y-2.5">
          {studentOrders.map(order => {
            const orderNum = order.order_number || order.orderId;
            const items = order.order_items || order.items || order.foodItems || [];
            const amount = Number(order.total_amount || order.totalAmount || 0);
            const status = (order.order_status || order.orderStatus || 'PAID').toUpperCase();

            return (
              <div 
                key={order.id || order.orderId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-white">#{orderNum}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </span>
                  </div>
                  <Badge variant={status.toLowerCase()}>{status}</Badge>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-400">{it.quantity}× {it.food_name_snapshot || it.name}</span>
                      <span className="font-mono text-slate-300">₹{Number(it.price_snapshot || it.price || 0) * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono">₹{amount.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    {/* 1-Tap Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition active:scale-95"
                      title="Reorder items into cart"
                    >
                      <RotateCcw className="w-3 h-3 text-orange-400" />
                      <span>Reorder</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudentOrder(order);
                        setStudentTab('qr');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <span>View Pass</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
