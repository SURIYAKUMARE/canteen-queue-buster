import React from 'react';
import { useCampus } from '../context/CampusContext';
import { Bell, Check, X, Clock, User, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function LiveOrderVendorModal() {
  const { liveVendorOrderPopup, setLiveVendorOrderPopup, acceptOrder, rejectOrder, activeRole } = useCampus();

  if (!liveVendorOrderPopup) return null;

  // Only show when in vendor role or split mode
  if (activeRole !== 'vendor' && activeRole !== 'split') return null;

  const order = liveVendorOrderPopup;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-orange-500 rounded-3xl max-w-md w-full shadow-2xl p-5 text-white space-y-4 relative overflow-hidden animate-scale-up">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40 animate-pulse">
              <Bell className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-white">🔔 New Order Received</h3>
                <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  ACTION NEEDED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Order #{order.orderId} • {order.createdAt}</p>
            </div>
          </div>
          <button
            onClick={() => setLiveVendorOrderPopup(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Information */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>{order.studentName}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Roll No: <strong className="text-slate-200">{order.studentId}</strong> • {order.studentDept}
            </div>
          </div>
          <div className="text-right">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30 block font-mono">
              {order.paymentStatus}
            </span>
            <span className="text-[10px] text-slate-400">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Ordered Food Items */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
            <span>Items to Prepare ({order.quantities})</span>
          </h4>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2 max-h-40 overflow-y-auto">
            {order.foodItems.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs text-slate-300">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                  {item.notes && (
                    <span className="text-[10px] text-amber-300 italic block pl-3">
                      Note: "{item.notes}"
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Bill Amount:</span>
              <strong className="text-base text-white font-bold">₹{order.totalAmount}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons: Accept / Reject */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => rejectOrder(order.orderId, 'Counter busy / Item unavailable')}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700"
          >
            <X className="w-4 h-4" />
            <span>Reject Order</span>
          </button>

          <button
            onClick={() => acceptOrder(order.orderId)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-orange-500/30 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Accept Order (Start Prep)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
