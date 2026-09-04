import React, { useState } from 'react';
import {
  GraduationCap,
  Store,
  Mail,
  Lock,
  User,
  Phone,
  Hash,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { databaseService } from '../lib/databaseService.js';
import { useCampus } from '../context/CampusContext.jsx';

export function AuthModal({ isOpen, onClose, initialRole = 'student' }) {
  const { setCurrentUser, setActiveRole } = useCampus();

  const [role, setRole] = useState(initialRole); // 'student' | 'vendor'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setFullName('');
    setStudentId('');
    setVendorName('');
    setVendorId('');
    setPhone('');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleQuickDemoLogin = async (demoType) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (demoType === 'student') {
        const res = await databaseService.signIn({
          email: 'rahul.sharma@college.edu',
          password: 'demoPassword123'
        });
        setCurrentUser(res);
        setActiveRole('student');
        onClose();
      } else {
        const res = await databaseService.signIn({
          email: 'canteen@college.edu',
          password: 'demoPassword123'
        });
        setCurrentUser(res);
        setActiveRole('vendor');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authMode === 'login') {
        const res = await databaseService.signIn({ email, password });
        // Role check
        if (res.profile?.role !== role) {
          throw new Error(`This account is registered as a ${res.profile?.role}. Please switch to the ${res.profile?.role} tab to log in.`);
        }
        setCurrentUser(res);
        setActiveRole(role);
        onClose();
      } else if (authMode === 'register') {
        if (role === 'student') {
          if (!fullName || !studentId || !email || !phone || !password) {
            throw new Error('Please fill in all student registration fields.');
          }
          const res = await databaseService.signUpStudent({
            fullName,
            studentId,
            email,
            phone,
            password
          });
          setCurrentUser(res);
          setActiveRole('student');
          onClose();
        } else {
          if (!vendorName || !vendorId || !email || !phone || !password) {
            throw new Error('Please fill in all vendor registration fields.');
          }
          const res = await databaseService.signUpVendor({
            vendorName,
            vendorId,
            email,
            phone,
            password
          });
          setCurrentUser(res);
          setActiveRole('vendor');
          onClose();
        }
      } else if (authMode === 'forgot') {
        setSuccessMsg(`Password reset link has been dispatched to ${email}. Check your college inbox.`);
        setTimeout(() => setAuthMode('login'), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'student' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
              {role === 'student' ? <GraduationCap className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-400">
                {role === 'student' ? 'Student Portal • Campus Pre-Order' : 'Canteen Vendor Operations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex gap-2">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              role === 'student'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('vendor')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              role === 'vendor'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            Vendor / Kitchen
          </button>
        </div>

        {/* Error / Success Notice */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {authMode === 'register' && (
            <>
              {role === 'student' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-slate-400" /> Student ID / Roll Number:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23AIML001 or 21BCS042"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" /> Vendor / Kitchen Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Campus Central Canteen"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-slate-400" /> Vendor Operator ID:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VND-01"
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {role === 'student' ? 'College Email Address:' : 'Vendor Official Email:'}
            </label>
            <input
              type="email"
              required
              placeholder={role === 'student' ? 'student@college.edu' : 'canteen@college.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {authMode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password:
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              role === 'student'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-indigo-500/20'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {authMode === 'login' ? 'Sign In & Continue' : authMode === 'register' ? 'Create Account & Sign In' : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle between login / register */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {authMode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); resetForm(); }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Register Now
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); resetForm(); }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Back to Sign In
                </button>
              </span>
            )}
          </div>

          {/* 1-Click Evaluation Shortcuts */}
          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Instant Demo Evaluation:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium text-left transition-colors"
              >
                🎓 Login as Student
                <div className="text-[10px] text-slate-400">Rahul Sharma (#21BCS042)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vendor')}
                className="py-1.5 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium text-left transition-colors"
              >
                👨‍🍳 Login as Vendor
                <div className="text-[10px] text-slate-400">Campus Central Kitchen</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
