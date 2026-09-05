import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Camera, 
  ShoppingBag, 
  ArrowRight,
  User,
  Hash,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

export default function VendorDashboard() {
  const { 
    orders, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    setVendorTab, 
    vendorUser,
    acceptOrder,
    startPrepOrder,
    markOrderReady,
    completeOrderHandover,
    currentUser
  } = useCampus();

  const currentVendorId = currentUser?.vendor?.id || vendorUser?.id;
  const currentVendorCode = currentUser?.vendor?.vendor_id || 'VEN001';
  const canteenName = currentUser?.vendor?.canteen_name || vendorUser?.name || 'Campus Central Canteen';
  const canteenDetails = currentUser?.vendor?.canteen_details || vendorUser?.counterBay || 'Counter Bay 1 & 2';

  // Vendor sees ONLY their canteen's paid orders
  const paidOrders = (orders || []).filter(o => {
    const vId = o.vendor_id || o.vendorId;
    const isThisVendor = !vId || vId === currentVendorId || vId === currentVendorCode;
    return isThisVendor &&
      (o.payment_status === 'PAID' || o.paymentStatus === 'PAID') &&
      (o.order_status !== 'CANCELLED' && o.orderStatus !== 'CANCELLED');
  });

  const formatOrderTime = (order) => {
    if (order.createdAt && typeof order.createdAt === 'string' && !order.createdAt.includes('T')) {
      return order.createdAt;
    }
    const dateStr = order.created_at || order.createdAt;
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ACCEPTED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'PREPARING':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse';
      case 'COMPLETED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fadeIn">
      {/* Canteen Vendor Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">{canteenName}</h2>
              <p className="text-[11px] text-slate-400 font-mono">Vendor ID: {currentVendorCode} • {canteenDetails}</p>
            </div>
          </div>

          <button
            onClick={toggleCanteenStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isCanteenOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span>{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>
        </div>
      </div>

      {/* Prominent [ SCAN QR ] Action Button */}
      <div className="pt-1">
        <button
          onClick={() => setVendorTab('scan')}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition transform active:scale-[0.98] border border-indigo-400/30"
        >
          <Camera className="w-6 h-6 animate-pulse" />
          <span>SCAN QR CODE</span>
          <ArrowRight className="w-5 h-5 ml-auto" />
        </button>
      </div>

      {/* Placed Paid Orders Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Placed Paid Orders</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              {paidOrders.length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Real-Time</span>
          </div>
        </div>

        {paidOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-xl">
              ⏳
            </div>
            <p className="font-semibold text-slate-300">No paid orders waiting.</p>
            <p className="text-[11px] text-slate-500">
              When a student places an order and pays, it will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidOrders.map((order) => {
              const orderId = order.order_number || order.orderNumber || order.id;
              const tokenNumber = order.token_number || order.tokenNumber || 'TKN245';
              const status = order.order_status || order.orderStatus || 'PAID';
              const paymentStatus = order.payment_status || order.paymentStatus || 'PAID';
              const studentName = order.students?.profiles?.full_name || order.students?.full_name || order.studentName || 'Arun Kumar';
              const studentId = order.students?.student_id || order.studentId || 'STU001';
              const items = order.order_items || order.items || order.foodItems || [];
              const totalAmount = Number(order.total_amount || order.totalAmount || 0);
              const orderTime = formatOrderTime(order);

              return (
                <div
                  key={order.id || orderId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 space-y-3 shadow-lg transition"
                >
                  {/* Order Header: Student Name & ID */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{studentName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Student ID: <strong className="text-slate-200">{studentId}</strong>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{orderTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order ID & Token Number */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-850 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Order ID</span>
                      <strong className="text-amber-400 font-bold text-sm">#{orderId}</strong>
                    </div>
                    <div className="border-l border-slate-800 pl-2">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Token Number</span>
                      <strong className="text-emerald-400 font-bold text-sm">{tokenNumber}</strong>
                    </div>
                  </div>

                  {/* Food Items & Quantity */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Food Items & Quantity:
                    </span>
                    <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-850 divide-y divide-slate-850/60">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs pt-1 first:pt-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400 font-mono bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 text-[11px]">
                              {item.quantity}×
                            </span>
                            <span className="text-slate-200">{item.food_name_snapshot || item.name}</span>
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">
                            ₹{(Number(item.price_snapshot || item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Amount & Payment Status */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Total Amount: </span>
                      <strong className="text-amber-400 font-black font-mono text-base">
                        ₹{totalAmount.toFixed(2)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {paymentStatus} ✓
                      </span>
                    </div>
                  </div>

                  {/* Quick kitchen status actions */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setVendorTab('scan')}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center justify-center gap-1.5 transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Verify QR Pass</span>
                    </button>

                    {status === 'PAID' && (
                      <button
                        onClick={() => acceptOrder(order.id || orderId)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
                      >
                        Accept
                      </button>
                    )}
                    {status === 'ACCEPTED' && (
                      <button
                        onClick={() => startPrepOrder(order.id || orderId)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
                      >
                        Start Prep
                      </button>
                    )}
                    {status === 'PREPARING' && (
                      <button
                        onClick={() => markOrderReady(order.id || orderId)}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                      >
                        Mark Ready
                      </button>
                    )}
                    {status === 'READY' && (
                      <button
                        onClick={() => completeOrderHandover(order.id || orderId)}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Hand Over ✓</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
