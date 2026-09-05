import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ScanLine,
  AlertCircle,
  Timer,
  Lock,
  WifiOff
} from 'lucide-react';
import { generateOrderQRCode } from '../utils/qrGenerator.js';
import { normalizeOrder } from '../utils/orderUtils.js';
import { generateSecurePassPayload } from '../utils/security.js';
import { Badge, Button } from './ui';

export default function StudentQRView() {
  const { 
    activeStudentOrder, 
    setStudentTab, 
    currentUser, 
    studentUser, 
    completeOrderHandover 
  } = useCampus();

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isCachedOffline, setIsCachedOffline] = useState(false);

  const order = normalizeOrder(activeStudentOrder);
  const orderNumber = order?.order_number || order?.orderNumber || 'ORD1001';
  const tokenNumber = order?.token_number || order?.tokenNumber || 'TKN245';
  const orderStatus = order?.order_status || order?.orderStatus || 'PAID';
  const paymentStatus = order?.payment_status || order?.paymentStatus || 'PAID';
  const totalAmount = Number(order?.total_amount || order?.totalAmount || 0);
  const items = order?.items || [];
  const studentName = currentUser?.profile?.full_name || order?.studentName || studentUser.name || 'Arun Kumar';
  const studentId = currentUser?.student?.student_id || order?.studentId || studentUser.rollNo || 'STU001';

  // Order creation timestamp and 60-minute expiry
  const createdTimestamp = new Date(order?.created_at || order?.createdAt || Date.now()).getTime();
  const expiresTimestamp = createdTimestamp + (60 * 60 * 1000);

  // Live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const remainingMs = expiresTimestamp - now;
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresTimestamp]);

  // Dynamic QR generation and offline caching
  useEffect(() => {
    if (!order) return;
    const cacheKey = `CAMPUSBITE_OFFLINE_PASS_${orderNumber}`;

    const generateQR = async () => {
      const orderId = order.order_number || order.orderId || order.id;
      const vendorId = order.vendor_id || order.vendorId || 'VEN001';

      // Check offline cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setQrDataUrl(cached);
          setIsCachedOffline(true);
        }
      } catch (e) {}

      try {
        const securePass = await generateSecurePassPayload({
          orderId,
          tokenNumber,
          studentId,
          vendorId,
          ttlMinutes: 60
        });

        const url = await generateOrderQRCode({
          ...securePass,
          studentName,
          amount: totalAmount
        });

        setQrDataUrl(url);
        try {
          localStorage.setItem(cacheKey, url);
          setIsCachedOffline(true);
        } catch (e) {}
      } catch (err) {
        console.error('Failed to generate dynamic QR code:', err);
      }
    };

    generateQR();
  }, [order, orderNumber, tokenNumber, studentName, studentId, totalAmount]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto text-3xl">
          🎫
        </div>
        <h3 className="text-lg font-bold text-white">No Active QR Pass Found</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You have not placed an order yet. Select food from the menu and complete payment to get your unique pickup pass.
        </p>
        <button
          onClick={() => setStudentTab('menu')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          Browse Canteen Menu
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (String(status).toUpperCase()) {
      case 'PENDING_PAYMENT':
        return { label: 'Payment Pending', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'PAID':
        return { label: 'Order Confirmed ✓ (Paid)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'ACCEPTED':
        return { label: 'Order Accepted by Kitchen', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'PREPARING':
        return { label: '👨‍🍳 Being Prepared in Kitchen', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'READY':
        return { label: '🔔 Ready for Pickup at Counter!', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' };
      case 'COMPLETED':
      case 'COLLECTED':
        return { label: '✓ Food Handed Over Successfully', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'CANCELLED':
        return { label: 'Order Cancelled', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const badge = getStatusBadge(orderStatus);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 px-4 text-white animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
          <QrCode className="w-5 h-5 text-amber-400" />
          <span>Digital Pickup Pass</span>
        </h2>
        <p className="text-xs text-slate-400">
          Generated securely for order #{orderNumber}
        </p>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/70 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl space-y-4 text-center">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Security Hologram Strip */}
        <div className="relative overflow-hidden bg-slate-950/80 border border-amber-500/30 rounded-2xl py-1.5 px-3 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>HMAC-SHA256 Signed</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Timer className="w-3 h-3 text-emerald-400" />
            <span>Valid: <strong className="text-white">{timeLeft}</strong></span>
          </div>
          {isCachedOffline && (
            <span className="text-[9px] text-slate-500 flex items-center gap-0.5" title="Available offline in canteen basement">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Offline Ready
            </span>
          )}
        </div>

        {/* Order Token Header */}
        <div className="space-y-2 border-b border-slate-800 pb-3">
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-extrabold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Payment Confirmed • Verified Token</span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order ID</span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wide text-amber-400">
                #{orderNumber}
              </div>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Token Number</span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wide text-emerald-400">
                {tokenNumber}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
            <span>Payment Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
              {paymentStatus} ✓
            </span>
          </div>
        </div>

        {/* The Dynamic QR Code */}
        <div className="relative mx-auto w-56 h-56 bg-white p-3.5 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-amber-500/40">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR for ${orderNumber}`}
              className="w-full h-full object-contain rounded-2xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 font-mono text-xs">
              <QrCode className="w-16 h-16 text-slate-900 animate-pulse" />
              <span>Generating Secure QR...</span>
            </div>
          )}

          {/* Center Brand Logo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-base font-black shadow-lg border-2 border-white">
              🍛
            </div>
          </div>
        </div>

        {/* Counter Pickup Instruction */}
        <div className="space-y-1.5">
          <p className="font-extrabold text-sm text-white tracking-tight">
            "Present this pass at the canteen counter bay."
          </p>
          <div className="inline-block">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Student:</span>
            <strong className="text-white font-sans font-semibold">{studentName}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Roll / ID:</span>
            <strong className="text-slate-200 font-bold">{studentId}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Order ID:</span>
            <strong className="text-amber-400 font-bold font-mono">#{orderNumber}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Token:</span>
            <strong className="text-emerald-400 font-bold font-mono">{tokenNumber}</strong>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-sans font-semibold flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-amber-400" /> Food Ordered:
            </span>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300 font-sans">
                <span>{item.quantity}× {item.food_name_snapshot || item.name}</span>
                <span className="font-mono text-slate-400">
                  ₹{(Number(item.price_snapshot || item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs">
            <span>Total Amount:</span>
            <span className="text-amber-400 text-sm font-black font-mono">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation Shortcuts */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setStudentTab('orders')}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Track Timeline</span>
          </button>

          <button
            onClick={() => setStudentTab('menu')}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order More Food →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
