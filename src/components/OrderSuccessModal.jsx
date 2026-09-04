import React from 'react';
import { useCampus } from '../context/CampusContext';
import { CheckCircle2, Clock, QrCode, ArrowRight, Sparkles, ChefHat } from 'lucide-react';

export default function OrderSuccessModal() {
  const { orderSuccessModal, setOrderSuccessModal, setStudentTab } = useCampus();

  if (!orderSuccessModal) return null;
  const order = orderSuccessModal;

  const handleOpenQR = () => {
    setOrderSuccessModal(null);
    setStudentTab('qr');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-white">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative overflow-hidden animate-scale-up">
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Celebration icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce-short">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
            PAYMENT SUCCESSFUL
          </span>
          <h3 className="text-2xl font-black text-white mt-2">Order Confirmed 🎉</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your pre-order has been forwarded to the canteen kitchen!
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-mono">Order ID:</span>
            <strong className="font-mono text-white text-sm font-black text-orange-400">
              #{order.orderId}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Student:</span>
            <strong className="text-slate-200">{order.studentName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Estimated Prep Time:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>~{order.estimatedPrepMins} mins</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pickup Counter:</span>
            <strong className="text-emerald-400">{order.counterBay || 'Bay 1 (Express)'}</strong>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold text-white font-mono">
            <span>Total Amount Paid:</span>
            <span className="text-emerald-400 text-sm">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* View QR Code Button */}
        <button
          onClick={handleOpenQR}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition active:scale-98 flex items-center justify-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          <span>View My Digital Smart QR Pass</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
