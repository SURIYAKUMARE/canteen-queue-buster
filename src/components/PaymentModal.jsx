import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { databaseService } from '../lib/databaseService.js';
import { useCampus } from '../context/CampusContext.jsx';
import { playSuccessChime } from '../utils/audioAlert.js';

export function PaymentModal({ isOpen, onClose, pendingOrder, onPaymentSuccess }) {
  const { studentUser, setOrderSuccessModal, setActiveStudentOrder, addNotification } = useCampus();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('student@okaxis');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (!isOpen || !pendingOrder) return null;

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isRazorpayConfigured = Boolean(razorpayKey && razorpayKey.startsWith('rzp_'));

  const handleProcessPayment = async () => {
    setProcessing(true);
    setPaymentError('');

    try {
      if (isRazorpayConfigured && typeof window !== 'undefined' && window.Razorpay) {
        // Real Razorpay Standard Checkout Flow
        const options = {
          key: razorpayKey,
          amount: Math.round(pendingOrder.total_amount * 100), // amount in paise
          currency: 'INR',
          name: 'CampusBite Canteen',
          description: `Pre-Order #${pendingOrder.order_number}`,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&auto=format&fit=crop&q=80',
          handler: async function (response) {
            // Secure payment completed callback
            await completePaymentFlow('Razorpay', response.razorpay_payment_id || `RZP-${Date.now()}`);
          },
          prefill: {
            name: studentUser?.name || 'Student',
            email: studentUser?.email || 'student@college.edu',
            contact: studentUser?.phone || '+919876543210'
          },
          theme: {
            color: '#F59E0B'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setPaymentError(resp.error?.description || 'Razorpay transaction was declined.');
          setProcessing(false);
        });
        rzp.open();
        return;
      }

      // TEST PAYMENT MODE (Simulates payment authorization while strictly preserving real database updates)
      await new Promise(resolve => setTimeout(resolve, 1400));

      const providerLabel =
        paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' :
        paymentMethod === 'card' ? 'Debit/Credit Card' :
        paymentMethod === 'wallet' ? 'Campus RFID Dining Wallet' : 'NetBanking';

      const txnId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      await completePaymentFlow(providerLabel, txnId);
    } catch (err) {
      console.error('Payment processing failed:', err);
      setPaymentError(err.message || 'Payment transaction failed. Please try another method.');
      setProcessing(false);
    }
  };

  const completePaymentFlow = async (provider, txnId) => {
    // 1. Update Supabase with verified payment and generate dynamic unique QR token
    const updatedOrder = await databaseService.completePayment({
      orderId: pendingOrder.id,
      paymentProvider: provider,
      transactionId: txnId,
      amount: pendingOrder.total_amount
    });

    // 2. Play audio confirmation and fire celebratory confetti
    try {
      playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // 3. Add student notification
    addNotification({
      targetRole: 'student',
      title: 'Payment Successful! 🎉',
      message: `Order #${updatedOrder.order_number} confirmed. Your secure pickup QR pass is ready.`,
      type: 'paid'
    });

    // 4. Update active order and trigger success modal
    setActiveStudentOrder(updatedOrder);
    setProcessing(false);
    onClose();

    if (onPaymentSuccess) {
      onPaymentSuccess(updatedOrder);
    }

    setOrderSuccessModal(updatedOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white flex items-center gap-1.5">
                Complete Payment
              </h2>
              <p className="text-xs text-slate-400">Order #{pendingOrder.order_number} • 256-Bit Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Breakdown Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Payable Amount:</div>
            <div className="text-2xl font-black text-amber-400">₹{pendingOrder.total_amount.toFixed(2)}</div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">{pendingOrder.items?.length || 1} Item(s)</div>
            {isRazorpayConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Razorpay Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3" /> Test Payment Mode
              </span>
            )}
          </div>
        </div>

        {/* Payment Error */}
        {paymentError && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* Methods */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Payment Method:</div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* UPI */}
            <label
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'upi'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">UPI (Google Pay / PhonePe / Paytm)</div>
                  <div className="text-[11px] text-slate-400">Instant QR or VPA checkout</div>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
                className="accent-amber-500 w-4 h-4"
              />
            </label>

            {/* RFID Wallet */}
            <label
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'wallet'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Campus RFID Dining Wallet</div>
                  <div className="text-[11px] text-slate-400">Balance: ₹450.00 • 1-Tap debit</div>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'wallet'}
                onChange={() => setPaymentMethod('wallet')}
                className="accent-amber-500 w-4 h-4"
              />
            </label>

            {/* Cards */}
            <label
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Credit / Debit Card</div>
                  <div className="text-[11px] text-slate-400">Visa, Mastercard, RuPay</div>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="accent-amber-500 w-4 h-4"
              />
            </label>

            {/* NetBanking */}
            <label
              onClick={() => setPaymentMethod('netbanking')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'netbanking'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Net Banking</div>
                  <div className="text-[11px] text-slate-400">SBI, HDFC, ICICI, Axis & more</div>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'netbanking'}
                onChange={() => setPaymentMethod('netbanking')}
                className="accent-amber-500 w-4 h-4"
              />
            </label>
          </div>

          {paymentMethod === 'upi' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs text-slate-400">Enter Student UPI ID:</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Secure simulated test flow: No bank details are saved. Clicking Pay updates the database to <strong>PAID</strong> and generates your unique dynamic pickup QR token.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400">Amount to Pay:</div>
            <div className="text-lg font-black text-amber-400">₹{pendingOrder.total_amount.toFixed(2)}</div>
          </div>

          <button
            onClick={handleProcessPayment}
            disabled={processing}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Payment...</span>
              </div>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Pay ₹{pendingOrder.total_amount.toFixed(2)} Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
