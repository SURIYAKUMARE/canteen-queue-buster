import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  User,
  Hash,
  Check
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useCampus } from '../context/CampusContext.jsx';
import { databaseService } from '../lib/databaseService.js';
import { playSuccessChime } from '../utils/audioAlert.js';

export default function VendorQRScanner() {
  const { orders, vendorUser, addNotification, refreshOrders } = useCampus();

  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // { valid, reason, isReused, order, student, items }
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');

  const html5QrCodeRef = useRef(null);

  // Ready orders available for quick testing
  const readyOrders = orders.filter(o => o.order_status === 'READY' || o.order_status === 'PAID' || o.order_status === 'ACCEPTED');

  const startCamera = async () => {
    setCameraError('');
    setVerificationResult(null);
    setCompletedSuccess(false);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Pause/stop scanner once detected
          stopCamera();
          handleScannedData(decodedText);
        },
        (errorMessage) => {
          // ignore frame scan errors
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.warn('Camera initiation failed or permission denied:', err);
      setCameraError(err.message || 'Camera access not granted or no webcam detected. You can use manual code validation or instant test buttons below.');
      setScannerActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScannedData = async (rawContent) => {
    setVerifying(true);
    setVerificationResult(null);
    setCompletedSuccess(false);

    try {
      let orderId = '';
      let qrToken = '';

      // Check if JSON payload
      try {
        const parsed = JSON.parse(rawContent);
        orderId = parsed.orderId || parsed.orderNumber || '';
        qrToken = parsed.token || parsed.qrToken || '';
      } catch (e) {
        // Plain text token or order number
        orderId = rawContent.trim();
      }

      const result = await databaseService.verifyQRCode({
        orderId,
        qrToken,
        vendorId: vendorUser?.id
      });

      setVerificationResult(result);
    } catch (err) {
      setVerificationResult({
        valid: false,
        reason: err.message || 'Verification failed unexpectedly.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmCollection = async () => {
    if (!verificationResult?.order?.id) return;
    setVerifying(true);

    try {
      await databaseService.confirmFoodCollection(verificationResult.order.id);

      playSuccessChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      addNotification({
        targetRole: 'student',
        title: 'Food Collected Successfully! 🍽️',
        message: `Your order #${verificationResult.order.order_number} has been verified and picked up at Counter Bay. Enjoy your meal!`,
        type: 'collected'
      });

      setCompletedSuccess(true);
      if (refreshOrders) refreshOrders();
    } catch (err) {
      alert('Failed to complete collection: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateScanOrder = (order) => {
    const payload = JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
      token: order.qr_token || 'demo-token',
      vendorId: order.vendor_id
    });
    handleScannedData(payload);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleScannedData(manualCodeInput.trim());
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Counter QR Code Scanner</h1>
            <p className="text-xs text-slate-400">Scan student pass to verify payment and complete order</p>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 sm:p-5">
        <div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden">
          {/* HTML5 QR Container */}
          <div
            id="qr-reader-container"
            className={`w-full h-full ${scannerActive ? 'block' : 'hidden'}`}
          />

          {!scannerActive && (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Live Camera Scanner</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Point camera at student's CampusBite QR pass to authenticate order and unlock food pickup.
                </p>
              </div>

              <button
                type="button"
                onClick={startCamera}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera & Scan</span>
              </button>
            </div>
          )}

          {scannerActive && (
            <div className="absolute bottom-4 z-10">
              <button
                type="button"
                onClick={stopCamera}
                className="py-2 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold backdrop-blur-sm border border-slate-700 transition-colors"
              >
                Close Camera
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* VERIFICATION RESULTS CARD */}
      {verifying && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Validating QR token with Supabase database...</p>
        </div>
      )}

      {/* VERIFIED: SUCCESSFUL MATCH */}
      {verificationResult && verificationResult.valid && !completedSuccess && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-5 space-y-4 animate-scaleUp text-slate-100">
          <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>ORDER VERIFIED & VALID</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              #{verificationResult.order.order_number}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-400" /> Student:
              </span>
              <p className="font-bold text-slate-100">{verificationResult.student?.full_name || 'Rahul Sharma'}</p>
              <p className="font-mono text-[11px] text-slate-400">{verificationResult.student?.student_id || '21BCS042'}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Payment:
              </span>
              <p className="font-bold text-emerald-400">₹{Number(verificationResult.order.total_amount).toFixed(2)}</p>
              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                PAID & VERIFIED
              </span>
            </div>
          </div>

          {/* Items Checklist */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Items for Collection:
            </span>
            <div className="divide-y divide-slate-800 bg-slate-900/80 rounded-xl border border-slate-800 p-2.5">
              {verificationResult.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                      {item.quantity}×
                    </span>
                    <span className="text-slate-200 font-medium">{item.food_name_snapshot || item.name}</span>
                  </div>
                  <span className="text-slate-400">₹{Number(item.price_snapshot || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Button */}
          <button
            onClick={handleConfirmCollection}
            disabled={verifying}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>CONFIRM FOOD COLLECTION & DELIVER</span>
          </button>
        </div>
      )}

      {/* COMPLETED SUCCESS SCREEN */}
      {completedSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500 text-center space-y-3 animate-scaleUp">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
            <Check className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Food Handed Over & Completed!</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Order #{verificationResult?.order?.order_number} marked as COMPLETED. This QR pass is now permanently retired and cannot be reused.
          </p>
          <button
            onClick={() => {
              setVerificationResult(null);
              setCompletedSuccess(false);
            }}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Scan Next Order
          </button>
        </div>
      )}

      {/* REJECTED / INVALID QR */}
      {verificationResult && !verificationResult.valid && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-600 text-slate-100 space-y-3 animate-shake">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-base">
            <XCircle className="w-5 h-5" />
            <span>INVALID OR REJECTED QR CODE</span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed bg-rose-950/80 p-3 rounded-xl border border-rose-800">
            {verificationResult.reason}
          </p>
          {verificationResult.isReused && (
            <div className="text-[11px] text-amber-300 font-medium">
              ⚠️ Warning: Anti-fraud protection triggered. Orders cannot be redeemed multiple times.
            </div>
          )}
          <button
            onClick={() => setVerificationResult(null)}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Dismiss & Try Again
          </button>
        </div>
      )}

      {/* Manual Token Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-indigo-400" /> Manual Token or Order # Verification:
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Order # (e.g. CB-8491) or QR Token"
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Rapid Test Simulation Bar (For easy viva/testing) */}
      {readyOrders.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Test Scan Active Ready Orders:
            </span>
            <span className="text-[10px] text-slate-500">1-click camera simulation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {readyOrders.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => handleSimulateScanOrder(ord)}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white group-hover:text-indigo-400">#{ord.order_number}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {ord.order_status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {ord.items?.map(i => `${i.quantity}x ${i.food_name_snapshot || i.name}`).join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { VendorQRScanner };
