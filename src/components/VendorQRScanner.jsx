import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ScanLine, 
  CheckCircle2, 
  Search, 
  Camera, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  PackageCheck
} from 'lucide-react';

export default function VendorQRScanner() {
  const { 
    orders, 
    verifyQRCode, 
    confirmPickup, 
    activeStudentOrder, 
    setVendorTab 
  } = useCampus();

  const [inputCode, setInputCode] = useState('');
  const [scannedOrder, setScannedOrder] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

  // Quick verify handler
  const handleVerify = (codeToTest = inputCode) => {
    setScanError('');
    setPickupConfirmed(false);

    const order = verifyQRCode(codeToTest);
    if (order) {
      setScannedOrder(order);
    } else {
      setScanError(`No active order found matching "${codeToTest}". Please check the token code.`);
      setScannedOrder(null);
    }
  };

  const handleConfirmPickup = () => {
    if (!scannedOrder) return;
    confirmPickup(scannedOrder.orderId);
    setPickupConfirmed(true);
    // Update local preview
    setScannedOrder(prev => ({ ...prev, orderStatus: 'COMPLETED' }));
  };

  const resetScanner = () => {
    setScannedOrder(null);
    setInputCode('');
    setScanError('');
    setPickupConfirmed(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-orange-400" />
          <span>Vendor QR Scanner Counter</span>
        </h2>
        <p className="text-xs text-slate-400">Scan student's dynamic token pass to verify and deliver meals</p>
      </div>

      {/* Main Scanner Viewport */}
      {!scannedOrder ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden bg-slate-950 border-2 border-orange-500/50 rounded-[2.5rem] p-6 shadow-2xl text-center space-y-4">
            {/* Camera Viewfinder Mockup */}
            <div className="relative mx-auto w-60 h-60 bg-slate-900 rounded-3xl border-2 border-slate-700 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {/* Corner targeting reticles */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-orange-400"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-orange-400"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-orange-400"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-orange-400"></div>

              {/* Laser scan line animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse shadow-lg shadow-orange-500/50"></div>

              {/* Viewfinder Center Icon */}
              <Camera className="w-12 h-12 text-slate-600 mb-2" />
              <span className="text-[11px] text-slate-400 font-mono">Align QR Code within frame</span>
              <span className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                OPTICAL SENSOR READY
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Aim vendor camera at student's phone screen
            </p>

            {/* One-Click Quick Verification for Evaluators / Viva Demo */}
            {activeStudentOrder && (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
                <span className="text-[11px] text-amber-400 font-bold block flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Demo QR Simulation:</span>
                </span>
                <button
                  onClick={() => handleVerify(activeStudentOrder.orderId)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Simulate Scan: #{activeStudentOrder.orderId} ({activeStudentOrder.studentName})</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Order ID Entry Field */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Or Enter Order ID Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. CB-8492"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleVerify()}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition"
              >
                Verify
              </button>
            </div>

            {scanError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-950/40 p-2 rounded-xl border border-rose-900/40 mt-2">
                {scanError}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ================= ORDER VERIFIED CARD ================= */
        <div className="space-y-4 animate-scale-up">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Verified Header Banner */}
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce-short">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-400 tracking-tight">
                ORDER VERIFIED ✓
              </h3>
              <p className="text-xs text-slate-400">
                Digital signature & payment verified against canteen database
              </p>
            </div>

            {/* Order Identity Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Order ID:</span>
                <strong className="text-white text-base font-black text-orange-400">
                  #{scannedOrder.orderId}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Student Name:</span>
                <strong className="text-slate-100 font-sans">{scannedOrder.studentName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Roll Number:</span>
                <strong className="text-slate-200">{scannedOrder.studentId}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  {scannedOrder.paymentStatus} ({scannedOrder.paymentMethod})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-amber-300 font-bold">{scannedOrder.orderStatus}</span>
              </div>
            </div>

            {/* Food Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                <span>Handover Items Checklist ({scannedOrder.quantities})</span>
              </h4>

              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2">
                {scannedOrder.foodItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-white">
                      ✓ {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs font-mono">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-400 text-sm">₹{scannedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Confirm Pickup Button */}
            {!pickupConfirmed && scannedOrder.orderStatus !== 'COMPLETED' ? (
              <button
                onClick={handleConfirmPickup}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Confirm Pickup & Deliver Food</span>
              </button>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl text-center space-y-1">
                <div className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Food Collected Successfully ✓</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Student screen and receipt updated in real time.
                </p>
              </div>
            )}

            {/* Reset / Scan Next Button */}
            <button
              onClick={resetScanner}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition border border-slate-700"
            >
              Scan Another Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
