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
  ArrowLeft,
  RefreshCw,
  Zap,
  Upload,
  AlertCircle,
  Eye,
  CameraOff
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useCampus } from '../context/CampusContext.jsx';
import { databaseService } from '../lib/databaseService.js';
import { playSuccessChime } from '../utils/audioAlert.js';

export default function VendorQRScanner() {
  const { orders, vendorUser, addNotification, refreshOrders, setVendorTab } = useCampus();

  const [scannerActive, setScannerActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // { valid, reason, isReused, order, studentName, studentId, orderId, tokenNumber, items, totalAmount, paymentStatus }
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');

  // Camera device management
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active paid orders available for quick testing simulation
  const activePaidOrders = (orders || []).filter(o => 
    (o.payment_status === 'PAID' || o.paymentStatus === 'PAID') &&
    (o.order_status !== 'COMPLETED' && o.orderStatus !== 'COMPLETED')
  );

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Notice while stopping camera:', e);
      }
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
    setCameraStarting(false);
    setTorchOn(false);
    setHasTorch(false);
  };

  const startCamera = async (cameraIndexToUse = null) => {
    setCameraError('');
    setVerificationResult(null);
    setCompletedSuccess(false);
    setCameraStarting(true);

    // Clean up any existing scanner instance
    await stopCamera();

    // Check for Secure Context (HTTPS or localhost)
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setCameraError('Camera access requires HTTPS or localhost. If testing over local network IP, please use HTTPS or use the Upload QR Screenshot / Manual Token options.');
      setCameraStarting(false);
      return;
    }

    try {
      // 1. Enumerate available video devices
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        if (Array.isArray(cameras) && cameras.length > 0) {
          setAvailableCameras(cameras);
        }
      } catch (e) {
        console.warn('Could not enumerate cameras:', e);
      }

      // Determine which camera to use
      let targetIdx = typeof cameraIndexToUse === 'number' ? cameraIndexToUse : currentCameraIndex;
      if (cameras.length > 0) {
        if (typeof cameraIndexToUse !== 'number') {
          // Prefer back / environment / rear camera
          const backIdx = cameras.findIndex(c => /back|rear|environment|primary/i.test(c.label));
          targetIdx = backIdx !== -1 ? backIdx : cameras.length - 1;
        }
        setCurrentCameraIndex(targetIdx);
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const boxSize = Math.floor(minEdge * 0.72);
          return {
            width: Math.max(180, Math.min(280, boxSize)),
            height: Math.max(180, Math.min(280, boxSize))
          };
        },
        aspectRatio: 1.0,
        disableFlip: false
      };

      const onScanSuccess = async (decodedText) => {
        try {
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
        } catch (e) {}
        await stopCamera();
        handleScannedData(decodedText);
      };

      let started = false;

      // Strategy 1: Use specific camera device ID
      if (cameras.length > 0 && cameras[targetIdx]?.id) {
        try {
          await html5QrCode.start(cameras[targetIdx].id, scanConfig, onScanSuccess, () => {});
          started = true;
        } catch (err) {
          console.warn('Failed to start with camera ID:', err);
        }
      }

      // Strategy 2: facingMode: environment
      if (!started) {
        try {
          await html5QrCode.start({ facingMode: 'environment' }, scanConfig, onScanSuccess, () => {});
          started = true;
        } catch (err) {
          console.warn('Failed to start with facingMode environment:', err);
        }
      }

      // Strategy 3: facingMode: user
      if (!started) {
        try {
          await html5QrCode.start({ facingMode: 'user' }, scanConfig, onScanSuccess, () => {});
          started = true;
        } catch (err) {
          console.warn('Failed to start with facingMode user:', err);
        }
      }

      // Strategy 4: default camera ID
      if (!started && cameras.length > 0) {
        try {
          await html5QrCode.start(cameras[0].id, scanConfig, onScanSuccess, () => {});
          started = true;
        } catch (err) {
          console.warn('Failed to start with cameras[0]:', err);
        }
      }

      if (started) {
        setScannerActive(true);
        setCameraStarting(false);

        // Check torch capabilities
        try {
          const capabilities = html5QrCode.getRunningTrackCapabilities();
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        } catch (e) {}
      } else {
        throw new Error('Unable to start camera stream with available video modes.');
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      let msg = err.message || 'Camera access not granted or no camera detected.';
      if (err.name === 'NotAllowedError' || msg.includes('Permission denied') || msg.includes('not allowed')) {
        msg = 'Camera permission was denied in your browser settings. Please click the camera icon in your browser address bar to allow access, or use the Upload QR Screenshot button below.';
      } else if (err.name === 'NotFoundError' || msg.includes('Requested device not found')) {
        msg = 'No camera device found on this system. You can test using the Upload QR Screenshot button or 1-Click Quick Chips below.';
      } else if (err.name === 'NotReadableError' || msg.includes('in use')) {
        msg = 'Camera is currently in use by another application or tab. Please close other camera apps and try again.';
      }
      setCameraError(msg);
      setScannerActive(false);
      setCameraStarting(false);
    }
  };

  const handleSwitchCamera = async () => {
    if (availableCameras.length < 2) return;
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);
    await startCamera(nextIndex);
  };

  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const newTorchState = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorchState }]
      });
      setTorchOn(newTorchState);
    } catch (err) {
      console.warn('Failed to toggle flashlight:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setCameraError('');
    setVerificationResult(null);

    try {
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode('qr-reader-container');
        html5QrCodeRef.current = scanner;
      }
      const decodedText = await scanner.scanFile(file, false);
      if (navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40]); } catch (e) {}
      }
      handleScannedData(decodedText);
    } catch (err) {
      console.warn('QR file scan error:', err);
      setCameraError('No valid QR code was detected in the uploaded image. Please ensure the QR code image is sharp, clear, and well-lit, or try manual token verification.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
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
      const result = await databaseService.verifyQRCode({
        rawPayload: rawContent,
        vendorId: vendorUser?.id
      });

      if (result && result.valid) {
        playSuccessChime();
      }

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
    if (e) e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleScannedData(manualCodeInput.trim());
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fadeIn">
      {/* Dynamic styling for HTML5 QR video */}
      <style>{`
        #qr-reader-container video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
        }
        #qr-reader-container {
          border: none !important;
        }
        @keyframes scanLaser {
          0% { top: 6%; opacity: 0.8; }
          50% { top: 92%; opacity: 1; }
          100% { top: 6%; opacity: 0.8; }
        }
        .animate-laser {
          animation: scanLaser 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setVendorTab('dashboard')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition cursor-pointer"
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl relative overflow-hidden">
        {/* Container with guaranteed dimensions for html5-qrcode */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
          {/* HTML5 QR Container (ALWAYS MOUNTED WITH DIMENSIONS) */}
          <div
            id="qr-reader-container"
            className="w-full h-full min-h-[280px]"
          />

          {/* ACTIVE SCANNER OVERLAY (Laser, Corner Target Brackets, Status Pill) */}
          {scannerActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
              {/* Top Status Bar */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-[10px] font-mono font-bold shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
                  <span>CAMERA ACTIVE</span>
                </span>

                {availableCameras.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] font-mono text-slate-300 border border-slate-700">
                    Cam {currentCameraIndex + 1}/{availableCameras.length}
                  </span>
                )}
              </div>

              {/* Corner Target Markers */}
              <div className="relative w-48 h-48 mx-auto my-auto pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Laser Scanning Beam */}
                <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-laser" />
              </div>

              {/* Bottom Instructions */}
              <div className="text-center">
                <span className="text-[11px] font-medium bg-slate-950/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                  Align student QR pass within frame
                </span>
              </div>
            </div>
          )}

          {/* INACTIVE / PLACEHOLDER OVERLAY (Shown when camera is off) */}
          {!scannerActive && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 space-y-3.5 z-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Live Camera Scanner</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Point camera at the student's CampusBite QR pass to verify payment and hand over food.
                </p>
              </div>

              {/* Open Camera Primary Action */}
              <button
                id="open-camera-btn"
                type="button"
                onClick={() => startCamera()}
                disabled={cameraStarting}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 mx-auto active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {cameraStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Open Camera & Scan</span>
                  </>
                )}
              </button>

              {/* Upload QR File / Snapshot Backup Option */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[11px] text-slate-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition underline underline-offset-4 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Decoding Image...' : '📁 Or Upload QR Screenshot / Photo'}</span>
              </button>
            </div>
          )}

          {/* Hidden File Input for QR Image Upload & Native Snapshot */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* ACTIVE CAMERA CONTROLS BAR (Close, Switch Camera, Flashlight) */}
        {scannerActive && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              id="close-camera-btn"
              type="button"
              onClick={stopCamera}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CameraOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Close Camera</span>
            </button>

            {availableCameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="Switch Camera"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Flip Cam</span>
              </button>
            )}

            {hasTorch && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  torchOn 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                }`}
                title="Toggle Torch / Flashlight"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{torchOn ? 'Flash On' : 'Flash'}</span>
              </button>
            )}
          </div>
        )}

        {/* Camera Permission / Error Guidance Alert */}
        {cameraError && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-amber-900/60">
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition cursor-pointer"
              >
                Retry Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[11px] border border-indigo-500/30 transition cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Screenshot</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VERIFYING SPINNER */}
      {verifying && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 animate-pulse shadow-xl">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-300">Validating order with database...</p>
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
              <span className="text-[10px] text-slate-400 font-sans block">Student:</span>
              <p className="font-bold text-white truncate">{verificationResult.studentName || 'Arun Kumar'}</p>
              <p className="text-[10px] text-slate-400">ID: {verificationResult.studentId || 'STU001'}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-sans block">Pickup Token:</span>
              <p className="font-black text-amber-400 text-sm tracking-wider">
                {verificationResult.tokenNumber || 'TKN870'}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold">PAID ✓</p>
            </div>
          </div>

          {/* Ordered Food Items Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Food Items to Prepare & Deliver:</span>
            </span>

            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {(verificationResult.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="text-slate-200 font-medium">
                      {item.food_name_snapshot || item.name || 'Food Item'}
                    </span>
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
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
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
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setVerificationResult(null);
                setCompletedSuccess(false);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Scan Another Order
            </button>
            <button
              onClick={() => {
                setVerificationResult(null);
                setCompletedSuccess(false);
                setVendorTab('dashboard');
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
            >
              Vendor Dashboard
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
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setManualCodeInput('TKN870');
                handleScannedData('TKN870');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>⚡ Try Demo Token TKN870</span>
            </button>
            <button
              onClick={() => setVerificationResult(null)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manual Order ID or Token Verification:</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Case-Insensitive
          </span>
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter token (e.g. TKN870, TKN876, TKN245)"
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            spellCheck="false"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={verifying}
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {verifying ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {/* Quick Demo Token Chips for viva and 1-tap testing */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>1-Click Test Quick Chips:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'TKN870', desc: 'Ready' },
              { label: 'TKN876', desc: 'Ready' },
              { label: 'TKN245', desc: 'Paid' },
              { label: 'ORD1001', desc: 'Arun' }
            ].map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setManualCodeInput(chip.label);
                  handleScannedData(chip.label);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/60 text-[11px] font-mono font-semibold text-slate-200 transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span className="text-amber-400 font-bold">⚡</span>
                <span className="text-white">{chip.label}</span>
                <span className="text-[10px] text-slate-400">({chip.desc})</span>
              </button>
            ))}
          </div>
        </div>
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
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition group flex items-center justify-between cursor-pointer"
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
