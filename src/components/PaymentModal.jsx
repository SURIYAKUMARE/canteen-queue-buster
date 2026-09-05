import React, { useState, useEffect } from 'react';
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
  console.log('>>> [PaymentModal] render, isOpen:', isOpen, 'pendingOrder:', pendingOrder);
  const { studentUser, setOrderSuccessModal, setActiveStudentOrder, addNotification, setStudentTab } = useCampus();

  const [vendor, setVendor] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'wallet'
  const [upiId, setUpiId] = useState('student@okaxis');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!pendingOrder) return;
    const loadVendor = async () => {
      try {
        const vId = pendingOrder.vendor_id || pendingOrder.vendorId;
        const v = await databaseService.getVendorById(vId);
        setVendor(v);
      } catch (e) {
        console.warn('Error loading vendor for payment:', e);
      }
    };
    loadVendor();
  }, [pendingOrder]);

  if (!isOpen || !pendingOrder) return null;

  const orderItems = pendingOrder.items || pendingOrder.foodItems || [];

  const handleProcessPayment = async () => {
    setProcessing(true);
    setPaymentError('');

    try {
      // TEST PAYMENT MODE: Instant, reliable simulated payment
      await new Promise(resolve => setTimeout(resolve, 800));

      const providerLabel =
        paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' :
        paymentMethod === 'card' ? 'Debit/Credit Card' : 'Campus RFID Wallet';

      const txnId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      await completePaymentFlow(providerLabel, txnId);
    } catch (err) {
      console.error('Payment processing failed:', err);
      setPaymentError(err.message || 'Payment transaction failed. Please try another method.');
      setProcessing(false);
    }
  };

  const completePaymentFlow = async (provider, txnId) => {
    // 1. Update database with verified payment and generate dynamic unique QR token
    const updatedOrder = await databaseService.completePayment({
      orderId: pendingOrder.id || pendingOrder.order_number,
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
      message: `Order #${updatedOrder.order_number || updatedOrder.orderId} confirmed. Token #${updatedOrder.token_number || 'TKN245'} ready for pickup.`,
      type: 'paid'
    });

    // 4. Update active order and navigate to QR View
    setActiveStudentOrder(updatedOrder);
    setOrderSuccessModal(null);
    setStudentTab('qr');
    setProcessing(false);
    onClose();

    if (onPaymentSuccess) {
      onPaymentSuccess(updatedOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white flex items-center gap-1.5">
                Payment Page
              </h2>
              <p className="text-xs text-slate-400">Order #{pendingOrder.order_number || pendingOrder.orderId}</p>
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

        {/* ORDER SUMMARY (Items, Quantity, Total Amount) */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {orderItems.length} Item(s)
            </span>
          </div>

          <div className="divide-y divide-slate-850 max-h-32 overflow-y-auto pr-1">
            {orderItems.map((item, idx) => (
              <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {item.quantity}×
                  </span>
                  <span className="text-slate-200 font-medium truncate max-w-[200px]">
                    {item.food_name_snapshot || item.name}
                  </span>
                </div>
                <span className="font-mono font-semibold text-slate-300">
                  ₹{(Number(item.price_snapshot || item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Amount:</span>
            <span className="text-xl font-black font-mono text-amber-400">
              ₹{Number(pendingOrder.total_amount || pendingOrder.totalAmount || 0).toFixed(2)}
            </span>
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
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Choose Payment Method:</div>

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
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3 text-center">
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                  Canteen Counter
                </span>
                <h4 className="font-extrabold text-sm text-white">
                  {vendor?.canteen_name || vendor?.vendor_name || 'Campus Central Canteen'}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  UPI ID: <strong className="text-slate-200">{vendor?.upi_id || 'canteen@okhdfcbank'}</strong>
                </p>
              </div>

              {/* Vendor's Configured GPay / UPI QR Image */}
              <div className="relative mx-auto w-44 h-44 sm:w-48 sm:h-48 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center border-2 border-amber-500/50">
                <img
                  src={
                    vendor?.upi_qr_url ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                      `upi://pay?pa=${vendor?.upi_id || 'canteen@okhdfcbank'}&pn=${encodeURIComponent(
                        vendor?.canteen_name || 'Campus Central Canteen'
                      )}&am=${Number(pendingOrder.total_amount || pendingOrder.totalAmount || 0).toFixed(2)}&cu=INR`
                    )}`
                  }
                  alt="Vendor Configured GPay QR"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 font-mono">
                  Scan & Pay ₹{Number(pendingOrder.total_amount || pendingOrder.totalAmount || 0).toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Scan with Google Pay, PhonePe, Paytm, or any UPI app. Once paid, click <strong>PAYMENT COMPLETED</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Secure verification: Clicking <strong>PAYMENT COMPLETED</strong> records payment as <strong>PAID</strong> and generates your unique pickup QR pass.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400">Amount to Pay:</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              ₹{Number(pendingOrder.total_amount || pendingOrder.totalAmount || 0).toFixed(2)}
            </div>
          </div>

          <button
            id="payment-completed-btn"
            onClick={handleProcessPayment}
            disabled={processing}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Payment...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PAYMENT COMPLETED</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
