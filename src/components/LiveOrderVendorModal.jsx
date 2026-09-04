import React from 'react';
import { useCampus } from '../context/CampusContext';
import { Bell, Check, X, User, ShoppingBag, ShieldCheck, Hash } from 'lucide-react';

export default function LiveOrderVendorModal() {
  const { liveVendorOrderPopup, setLiveVendorOrderPopup, acceptOrder, rejectOrder, activeRole } = useCampus();

  if (!liveVendorOrderPopup) return null;

  // Only show when in vendor role or split presentation mode
  if (activeRole !== 'vendor' && activeRole !== 'split') return null;

  const order = liveVendorOrderPopup;
  const orderId = order.id || order.orderId;
  const orderNumber = order.order_number || order.orderNumber || 'CB-10245';
  const studentName = order.students?.full_name || order.studentName || 'Student';
  const studentId = order.students?.student_id || order.studentId || '23AIML001';
  const totalAmount = Number(order.total_amount || order.totalAmount || 0);
  const paymentStatus = order.payment_status || order.paymentStatus || 'PAID';
  const items = order.order_items || order.items || order.foodItems || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-sm w-full shadow-2xl p-5 text-white space-y-4 relative overflow-hidden animate-scaleUp">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 animate-bounce">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                🔔 NEW ORDER
              </h3>
              <p className="text-xs text-indigo-400 font-mono font-bold">#{orderNumber}</p>
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
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Student:
            </span>
            <strong className="text-white text-sm">{studentName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-400" /> Student ID:
            </span>
            <strong className="text-slate-200 font-mono">{studentId}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Payment:
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px]">
              {paymentStatus}
            </span>
          </div>
        </div>

        {/* Ordered Food Items */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Items Ordered:</span>
          </h4>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-1.5 max-h-40 overflow-y-auto text-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-200">
                <span className="font-medium">
                  {item.quantity} × {item.food_name_snapshot || item.name}
                </span>
                <span className="font-mono text-slate-400">
                  ₹{Number(item.price_snapshot || item.price || 0) * item.quantity}
                </span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Total:</span>
              <span className="text-amber-400 text-sm font-mono">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: ACCEPT ORDER / REJECT ORDER */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => acceptOrder(orderId)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>ACCEPT ORDER</span>
          </button>

          <button
            onClick={() => rejectOrder(orderId, 'Counter busy / Item unavailable')}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-rose-400 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition border border-slate-700 active:scale-98"
          >
            <X className="w-4 h-4" />
            <span>REJECT ORDER</span>
          </button>
        </div>
      </div>
    </div>
  );
}
