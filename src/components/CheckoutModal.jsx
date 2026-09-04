import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  X, 
  ArrowLeft, 
  CheckCircle, 
  ShieldCheck, 
  User, 
  Clock, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cartItemsArray, 
    cartTotal, 
    studentUser, 
    placeOrder,
    setStudentTab
  } = useCampus();

  const [paymentMethod, setPaymentMethod] = useState('Campus RFID Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  if (!isCheckoutOpen) return null;

  const paymentOptions = [
    {
      id: 'Campus RFID Card',
      title: 'Campus Smart RFID Card',
      sub: `Balance: ₹${studentUser.walletBalance}`,
      icon: Wallet,
      tag: 'INSTANT'
    },
    {
      id: 'UPI (GPay / PhonePe)',
      title: 'UPI Payment',
      sub: 'Google Pay • PhonePe • Paytm',
      icon: Smartphone,
      tag: 'FAST'
    },
    {
      id: 'Credit / Debit Card',
      title: 'Debit / Credit Card',
      sub: 'Visa • Mastercard • RuPay',
      icon: CreditCard,
      tag: 'SECURE'
    }
  ];

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      // Simulate realistic payment gateway processing
      await new Promise(r => setTimeout(r, 900));
      await placeOrder({ paymentMethod, notes: orderNotes });
      setStudentTab('qr');
    } catch (err) {
      alert('Payment simulation error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-white">Checkout & Pre-Order</h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Student Profile Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Student Verification</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                VERIFIED STUDENT
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-500/40 font-mono">
                {studentUser.rollNo.slice(-3)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{studentUser.name}</h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  Roll No: <strong className="text-slate-200">{studentUser.rollNo}</strong> • {studentUser.dept}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Items Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Order Summary ({cartItemsArray.length} items)
            </h4>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2">
              {cartItemsArray.map(item => (
                <div key={item.food.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-orange-400">{item.quantity}x</span>
                    <span className="truncate">{item.food.name}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">₹{item.food.price * item.quantity}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs">
                <span>Total Amount to Pay</span>
                <span className="font-mono text-orange-400 text-sm">₹{cartTotal}</span>
              </div>
            </div>
          </div>

          {/* Cooking instructions */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              Instructions for Canteen Kitchen:
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy chutney, pack takeaway"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Choose Payment Method */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Choose Simulated Payment Method
            </h4>

            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`border rounded-2xl p-3 cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{opt.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-orange-500 bg-orange-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Pay Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Simulated Campus Payment Gateway</span>
            </span>
            <span className="font-mono text-white font-bold">Total: ₹{cartTotal}</span>
          </div>

          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition active:scale-98 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Processing Payment & Generating Unique QR...</span>
              </div>
            ) : (
              <span>Pay ₹{cartTotal} Now & Generate Smart Token QR</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
