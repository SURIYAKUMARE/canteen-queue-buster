import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Share2, 
  ChefHat, 
  Sparkles,
  ArrowRight,
  ScanLine
} from 'lucide-react';

export default function StudentQRView() {
  const { activeStudentOrder, setStudentTab, setActiveRole, setVendorTab } = useCampus();

  if (!activeStudentOrder) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto text-3xl">
          🎫
        </div>
        <h3 className="text-lg font-bold text-white">No Active QR Token Found</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You haven't placed an order yet in this session. Order fresh meals to get a dynamic pickup QR pass!
        </p>
        <button
          onClick={() => setStudentTab('menu')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  const order = activeStudentOrder;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Order Confirmed (Pending Kitchen)', color: 'bg-slate-700 text-slate-200 border-slate-600' };
      case 'PREPARING':
        return { label: '👨‍🍳 Being Prepared in Kitchen', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'READY':
        return { label: '🔔 Ready for Pickup at Counter!', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' };
      case 'COMPLETED':
        return { label: '✓ Food Collected Successfully', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300' };
    }
  };

  const badge = getStatusBadge(order.orderStatus);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 px-4 text-white animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
          <QrCode className="w-5 h-5 text-orange-400" />
          <span>My Smart Token QR</span>
        </h2>
        <p className="text-xs text-slate-400">
          Show this unique digital token to the canteen vendor for contactless pickup
        </p>
      </div>

      {/* Main Dynamic QR Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-orange-500/60 rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-center">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Order Token Header */}
        <div className="space-y-1 border-b border-slate-800 pb-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">DIGITAL PICKUP PASS</span>
          <div className="text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
            #{order.orderId}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Placed at: {order.createdAt} • {order.counterBay}
          </div>
        </div>

        {/* The Live Generated QR Code */}
        <div className="relative mx-auto w-56 h-56 bg-white p-3 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-orange-500/30">
          {order.qrCodeImage ? (
            <img
              src={order.qrCodeImage}
              alt={`QR for ${order.orderId}`}
              className="w-full h-full object-contain rounded-2xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 font-mono text-xs">
              <QrCode className="w-20 h-20 text-slate-900 animate-pulse" />
              <span>Generating QR...</span>
            </div>
          )}

          {/* Center Brand Logo Overlay on QR */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-lg font-black shadow-lg border-2 border-white">
              🍛
            </div>
          </div>
        </div>

        {/* Notice string */}
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-white tracking-tight">
            "Show this QR code at the canteen counter"
          </p>
          <div className="inline-block">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Details Below QR */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Student Name:</span>
            <strong className="text-white font-sans">{order.studentName}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Student ID / Roll:</span>
            <strong className="text-slate-200">{order.studentId}</strong>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-sans font-semibold">Ordered Items:</span>
            {order.foodItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300 font-sans">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs">
            <span>Amount Paid:</span>
            <span className="text-orange-400 text-sm">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Navigation / Demo buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setStudentTab('orders')}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition"
          >
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Track Timeline</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('vendor');
              setVendorTab('scan');
            }}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-md"
            title="Switch to Vendor view and test scanning this exact QR code"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Simulate Scan →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
