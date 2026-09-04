import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Clock,
  User,
  Hash,
  Check,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useCampus } from '../context/CampusContext.jsx';
import { databaseService } from '../lib/databaseService.js';
import { playSuccessChime } from '../utils/audioAlert.js';

export default function VendorQRScanner() {
  const { orders, vendorUser, addNotification, refreshOrders, setVendorTab } = useCampus();

  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // { valid, reason, isReused, order, studentName, studentId, orderId, tokenNumber, items, totalAmount, paymentStatus }
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');

  const html5QrCodeRef = useRef(null);

  // Active paid orders available for quick testing simulation
  const activePaidOrders = (orders || []).filter(o => 
    (o.payment_status === 'PAID' || o.paymentStatus === 'PAID') &&
    (o.order_status !== 'COMPLETED' && o.orderStatus !== 'COMPLETED')
  );

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
          stopCamera();
          handleScannedData(decodedText);
        },
        () => {
          // ignore frame scan errors
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.warn('Camera initiation failed or permission denied:', err);
      setCameraError(err.message || 'Camera access not granted or no webcam detected. You can test using the quick scan buttons or manual entry below.');
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
    // Attempt camera auto-start if possible
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleScannedData = async (rawContent) => {
    setVerifying(true);
    setVerificationResult(null);
    setCompletedSuccess(false);

    try {
      const result = await databaseService.verifyQRCode({
        rawPayload: rawContent,
        vendorId: vendorUser?.id
      });

      setVerificationResult(result);
    } catch (err) {
      setVerificationResult({
        valid: false,
        reason: 'Invalid Order / QR: ' + (err.message || 'Verification failed')
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmHandover = async () => {
    const targetId = verificationResult?.order?.id || verificationResult?.orderId;
    if (!targetId) return;

    setVerifying(true);

    try {
      await databaseService.confirmFoodHandover(targetId);

      playSuccessChime();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      addNotification({
        targetRole: 'student',
        title: 'Food Handed Over Successfully! 🍽️',
        message: `Your order #${verificationResult?.orderId} has been delivered. Enjoy your meal!`,
        type: 'collected'
      });

      setCompletedSuccess(true);
      if (refreshOrders) refreshOrders();
    } catch (err) {
      alert('Failed to confirm handover: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateScanOrder = (ord) => {
    const payload = JSON.stringify({
      orderId: ord.order_number || ord.orderId || ord.id,
      orderNumber: ord.order_number || ord.orderId || ord.id,
      tokenNumber: ord.token_number || ord.tokenNumber || 'TKN245',
      studentName: ord.students?.profiles?.full_name || ord.studentName || 'Arun Kumar',
      studentId: ord.students?.student_id || ord.studentId || 'STU001',
      token: ord.qr_token || 'SEC-TOK-DEMO',
      amount: Number(ord.total_amount || ord.totalAmount || 0)
    });
    handleScannedData(payload);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleScannedData(manualCodeInput.trim());
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fadeIn">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setVendorTab('dashboard')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Vendor QR Scanner</h1>
            <p className="text-[11px] text-slate-400">Scan student pass to verify payment and hand over food</p>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center overflow-hidden">
          {/* HTML5 QR Container */}
          <div
            id="qr-reader-container"
            className={`w-full h-full ${scannerActive ? 'block' : 'hidden'}`}
          />

          {!scannerActive && (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Camera Viewfinder</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Point camera at the student's CampusBite QR pass to verify order.
                </p>
              </div>

              <button
                type="button"
                onClick={startCamera}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 mx-auto"
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
                className="py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold backdrop-blur-sm border border-slate-700 transition"
              >
                Close Camera
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
            <span>📷 {cameraError}</span>
          </div>
        )}
      </div>

      {/* VERIFYING SPINNER */}
      {verifying && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 animate-pulse shadow-xl">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-300">Validating order with Supabase database...</p>
        </div>
      )}

      {/* 1. SUCCESSFUL VERIFICATION CARD */}
      {verificationResult && verificationResult.valid && !completedSuccess && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-3xl p-5 space-y-4 shadow-2xl animate-scaleUp text-slate-100">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-black text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>✓ ORDER VERIFIED</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              #{verificationResult.orderId}
            </span>
          </div>

          {/* Student & Order Details */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold block">Student Name</span>
              <p className="font-bold text-white font-sans text-sm">{verificationResult.studentName}</p>
              <p className="text-slate-400 text-[11px]">ID: {verificationResult.studentId}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold block">Token Number</span>
              <p className="font-black text-emerald-400 text-base">{verificationResult.tokenNumber}</p>
              <p className="text-[11px] text-emerald-400 font-sans font-bold">Status: PAID ✓</p>
            </div>
          </div>

          {/* Food Ordered & Quantity */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Food Ordered & Quantity:</span>
            </span>

            <div className="divide-y divide-slate-800 bg-slate-950/80 rounded-2xl border border-slate-800 p-3">
              {(verificationResult.items || []).map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                      {item.quantity}×
                    </span>
                    <span className="text-slate-200 font-medium">{item.food_name_snapshot || item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    ₹{(Number(item.price_snapshot || item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount & Payment Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold">Total Amount:</span>
            <span className="text-amber-400 font-black font-mono text-base">
              ₹{Number(verificationResult.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          {/* CONFIRM FOOD HANDOVER BUTTON */}
          <button
            onClick={handleConfirmHandover}
            disabled={verifying}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>CONFIRM FOOD HANDOVER</span>
          </button>
        </div>
      )}

      {/* 2. HANDOVER COMPLETED MESSAGE */}
      {completedSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-950/60 border-2 border-emerald-500 text-center space-y-3 shadow-2xl animate-scaleUp">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <h3 className="text-lg font-black text-white">Food handed over successfully ✓</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Order #{verificationResult?.orderId} (Token: {verificationResult?.tokenNumber}) status is now <strong>COMPLETED</strong>. This QR code / Token is marked as <strong>USED</strong> and cannot be reused.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setVerificationResult(null);
                setCompletedSuccess(false);
                setVendorTab('dashboard');
              }}
              className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition border border-slate-700"
            >
              Return to Vendor Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 3. INVALID OR ALREADY USED QR CARD */}
      {verificationResult && !verificationResult.valid && (
        <div className="p-5 rounded-3xl bg-rose-950/50 border-2 border-rose-600 text-slate-100 space-y-3 shadow-2xl animate-shake">
          <div className="flex items-center space-x-2 text-rose-400 font-black text-base">
            <XCircle className="w-5 h-5" />
            <span>Invalid Order / QR</span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed bg-rose-950/80 p-3 rounded-2xl border border-rose-800 font-mono">
            {verificationResult.reason || 'Invalid Order / QR'}
          </p>
          {verificationResult.isReused && (
            <div className="text-[11px] text-amber-300 font-semibold bg-amber-950/40 p-2.5 rounded-xl border border-amber-800">
              ⚠️ Anti-fraud Protection: This token has already been redeemed and cannot be reused.
            </div>
          )}
          <button
            onClick={() => setVerificationResult(null)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
          >
            Scan Another QR
          </button>
        </div>
      )}

      {/* Manual Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-indigo-400" />
          <span>Manual Order ID or Token Verification:</span>
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. ORD1001 or TKN245"
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Quick Test Simulation Bar (For viva & testing without camera) */}
      {activePaidOrders.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Test Scan Active Paid Orders:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Viva Shortcut</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {activePaidOrders.slice(0, 3).map((ord) => (
              <button
                key={ord.id || ord.order_number}
                type="button"
                onClick={() => handleSimulateScanOrder(ord)}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-xs group-hover:text-indigo-400">
                      #{ord.order_number || ord.orderId}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {ord.token_number || ord.tokenNumber || 'TKN245'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ord.students?.full_name || ord.studentName || 'Student'} • ₹{Number(ord.total_amount || ord.totalAmount || 0).toFixed(2)}
                  </div>
                </div>

                <span className="text-xs text-indigo-400 font-bold group-hover:translate-x-0.5 transition">
                  Test Scan →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
