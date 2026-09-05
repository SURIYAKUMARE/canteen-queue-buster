import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { databaseService } from '../lib/databaseService';
import { ChefHat, ArrowLeft, Lock, User, AlertCircle, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function VendorLogin({ onBack }) {
  const { setCurrentUser, setActiveRole, setVendorTab, setVendorUser } = useCampus();

  const [vendorId, setVendorId] = useState('VEN001');
  const [password, setPassword] = useState('vendor123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await databaseService.signIn({
        identifier: vendorId,
        vendorId,
        password,
        role: 'vendor'
      });

      // Update vendor user state
      if (res.vendor) {
        setVendorUser(prev => ({
          ...prev,
          id: res.vendor.id,
          name: res.vendor.canteen_name || res.vendor.vendor_name || prev.name,
          counterBay: res.vendor.canteen_details || prev.counterBay,
          email: res.vendor.email || prev.email,
          upiId: res.vendor.upi_id || 'canteen@okhdfcbank',
          upiQrUrl: res.vendor.upi_qr_url,
          isLoggedIn: true
        }));
      }

      setCurrentUser(res);
      setActiveRole('vendor');
      setVendorTab('dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Vendor login failed. Please verify your Vendor ID and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 text-white animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            id="back-to-start-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition py-1 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Start</span>
          </button>
          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            Vendor Portal
          </span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Vendor Login</h2>
          <p className="text-xs text-slate-400">
            Enter your Vendor ID and password to manage canteen orders.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vendor ID or Registered Email</span>
            </label>
            <input
              id="vendor-id-input"
              type="text"
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="e.g. VEN001 or vendor@college.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                id="vendor-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="vendor-submit-btn"
            data-testid="vendor-login-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Vendor ID...</span>
              </div>
            ) : (
              <>
                <span>Sign In as Vendor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 text-left space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Demo Vendor Account:
            </span>
            <button
              id="vendor-quick-fill-btn"
              type="button"
              onClick={() => {
                setVendorId('VEN001');
                setPassword('vendor123');
              }}
              className="text-[10px] text-indigo-400 hover:underline font-mono"
            >
              Fill Credentials
            </button>
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <span>ID: <strong className="text-white">VEN001</strong></span>
            <span>Pass: <strong className="text-white">vendor123</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
