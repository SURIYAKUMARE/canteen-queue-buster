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
  Sparkles
} from 'lucide-react';

export default function StudentOrders() {
  const { orders, setActiveStudentOrder, setStudentTab, studentUser, addToCart, setIsCartOpen } = useCampus();

  // Filter orders for current student
  const studentOrders = orders.filter(o => 
    !o.studentId || o.studentId === studentUser.rollNo || o.studentName.toLowerCase().includes('rahul') || o.studentName.toLowerCase().includes('priya')
  );

  const trackingSteps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received by system' },
    { key: 'PAID', label: 'Payment Successful', desc: 'Instant campus payment' },
    { key: 'PREPARING', label: 'Preparing in Kitchen', desc: 'Chef cooking fresh meals' },
    { key: 'READY', label: 'Ready for Pickup', desc: 'Packed at pickup bay' },
    { key: 'COMPLETED', label: 'Collected by Student', desc: 'QR code verified' },
  ];

  const getStepProgressIndex = (status) => {
    switch (status) {
      case 'PENDING': return 2; // Placed (0), Paid (1) done, waiting for prep
      case 'PREPARING': return 3;
      case 'READY': return 4;
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  const activeOrder = studentOrders.find(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED') || studentOrders[0];

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 px-4 text-white animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>📦 My Orders & Live Tracking</span>
        </h2>
        <p className="text-xs text-slate-400">Track your meal prep stages and view past canteen receipts</p>
      </div>

      {/* Active Order Live Tracker */}
      {activeOrder && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-orange-500/50 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIVE ORDER TRACKING</span>
              <div className="text-xl font-black font-mono text-white">#{activeOrder.orderId}</div>
            </div>
            <button
              onClick={() => {
                setActiveStudentOrder(activeOrder);
                setStudentTab('qr');
              }}
              className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition font-mono"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="py-2 space-y-3">
            {trackingSteps.map((step, idx) => {
              const currentProgress = getStepProgressIndex(activeOrder.orderStatus);
              const isDone = currentProgress > idx;
              const isCurrent = currentProgress === idx + 1;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Vertical connector line */}
                  {idx < trackingSteps.length - 1 && (
                    <div 
                      className={`absolute left-3.5 top-6 w-0.5 h-7 transition-colors ${
                        isDone ? 'bg-orange-500' : 'bg-slate-800'
                      }`}
                    ></div>
                  )}

                  {/* Node icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-all z-10 ${
                      isDone
                        ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/40'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${
                        isDone || isCurrent ? 'text-white' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </h5>
                      {isCurrent && (
                        <span className="text-[10px] bg-orange-500/20 text-orange-300 font-mono px-2 py-0.2 rounded-full font-bold border border-orange-500/30">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Pickup Counter:</span>
            <strong className="text-emerald-400 font-bold">{activeOrder.counterBay || 'Bay 1 (Express)'}</strong>
          </div>
        </div>
      )}

      {/* Order History Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider text-xs">
          Previous Orders ({studentOrders.length})
        </h3>

        {studentOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No orders history yet.
          </div>
        ) : (
          studentOrders.map((ord) => (
            <div
              key={ord.orderId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-2.5 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-xs bg-slate-800 px-2 py-0.5 rounded-md">
                    #{ord.orderId}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ord.createdAt}</span>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    ord.orderStatus === 'COMPLETED'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : ord.orderStatus === 'READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                      : ord.orderStatus === 'PREPARING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {ord.orderStatus}
                </span>
              </div>

              {/* Items */}
              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {ord.foodItems.map((it, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-mono text-slate-400">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="font-mono font-bold text-orange-400 text-sm">
                  Total: ₹{ord.totalAmount}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveStudentOrder(ord);
                      setStudentTab('qr');
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-orange-400" />
                    <span>View QR</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
