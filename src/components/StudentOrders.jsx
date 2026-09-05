import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ChefHat, 
  PackageCheck, 
  CreditCard, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  BellRing
} from 'lucide-react';

export default function StudentOrders() {
  const { orders, setActiveStudentOrder, setStudentTab, currentUser, studentUser, addToCart, setIsCartOpen } = useCampus();

  const currentStudentId = currentUser?.student?.id || studentUser.id;
  const currentRollNo = currentUser?.student?.student_id || studentUser.rollNo;

  // Filter orders strictly for current logged-in student
  const studentOrders = orders.filter(o => {
    const sId = o.student_id || o.studentId;
    return sId === currentStudentId || sId === currentRollNo;
  });

  const trackingSteps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received in queue' },
    { key: 'PAID', label: 'Payment Successful', desc: '256-bit verified payment' },
    { key: 'ACCEPTED', label: 'Order Accepted', desc: 'Kitchen acknowledged order' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Cooking fresh meals' },
    { key: 'READY', label: 'Ready for Pickup', desc: 'Packed at counter bay' },
    { key: 'COMPLETED', label: 'Completed', desc: 'QR scanned & food handed over' },
  ];

  const getStepProgressIndex = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 1;
      case 'PAID': return 2;
      case 'ACCEPTED': return 3;
      case 'PREPARING': return 4;
      case 'READY': return 5;
      case 'COMPLETED': return 6;
      default: return 2;
    }
  };

  const activeOrder = studentOrders.find(o => 
    o.order_status !== 'COMPLETED' && 
    o.orderStatus !== 'COMPLETED' && 
    o.order_status !== 'CANCELLED' && 
    o.orderStatus !== 'CANCELLED'
  ) || studentOrders[0];

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
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition font-mono"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="py-2 space-y-3.5">
            {trackingSteps.map((step, idx) => {
              const currentStatus = activeOrder.order_status || activeOrder.orderStatus;
              const currentProgress = getStepProgressIndex(currentStatus);
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
                    ></div>
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
            const status = order.order_status || order.orderStatus || 'PAID';

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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs text-slate-300">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-400">{it.quantity}× {it.food_name_snapshot || it.name}</span>
                      <span className="font-mono text-slate-300">₹{Number(it.price_snapshot || it.price || 0) * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono">₹{amount.toFixed(2)}</span>
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
