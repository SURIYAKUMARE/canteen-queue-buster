import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Lock,
  User,
  ShoppingBag
} from 'lucide-react';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cartItemsArray, 
    cartTotal, 
    studentUser,
    currentUser,
    initiateCheckout
  } = useCampus();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  if (!isCheckoutOpen) return null;

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    try {
      // Calls Supabase createPendingOrder with PENDING_PAYMENT status
      await initiateCheckout({ notes: orderNotes });
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const studentName = currentUser?.profile?.full_name || studentUser.name;
  const studentRoll = currentUser?.student?.student_id || studentUser.rollNo;
  const studentEmail = currentUser?.profile?.email || studentUser.email;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-white">Order Checkout Review</h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Student Profile Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Student Credentials</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/40 font-mono">
                {studentRoll.slice(-3)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{studentName}</h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  Roll: <strong className="text-slate-200">{studentRoll}</strong> • {studentEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Items Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              Order Items Breakdown ({cartItemsArray.length} items)
            </h4>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2">
              {cartItemsArray.map(item => (
                <div key={item.food.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-amber-400">{item.quantity}x</span>
                    <span className="truncate">{item.food.name}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">₹{Number(item.food.price) * item.quantity}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs">
                <span>Cart Subtotal</span>
                <span className="font-mono text-amber-400 text-sm">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cooking instructions */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              Kitchen Instructions / Allergies:
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra chutney, takeaway pack"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Order Status Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Order Integrity Note:
            </div>
            <p>
              Clicking <strong>Proceed to Payment</strong> creates a <code>PENDING_PAYMENT</code> order in the Supabase database. Your unique dynamic pickup QR pass is generated <strong>only after payment confirmation</strong>.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Payable:</span>
            <span className="font-mono text-white font-black text-sm">₹{cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition active:scale-98 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Pending Order in Supabase...</span>
              </div>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
