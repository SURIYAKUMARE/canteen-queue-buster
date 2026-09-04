import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { databaseService } from '../lib/databaseService';
import { GraduationCap, ChefHat, Sparkles, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

export default function RoleSelectLogin() {
  const { setCurrentUser, setActiveRole, setStudentTab, setVendorTab } = useCampus();

  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'vendor'
  const [studentId, setStudentId] = useState('STU001');
  const [studentPassword, setStudentPassword] = useState('student123');
  const [vendorId, setVendorId] = useState('VEN001');
  const [vendorPassword, setVendorPassword] = useState('vendor123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (roleToLogin, idVal, pwdVal) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await databaseService.signIn({
        identifier: idVal,
        studentId: roleToLogin === 'student' ? idVal : undefined,
        vendorId: roleToLogin === 'vendor' ? idVal : undefined,
        password: pwdVal,
        role: roleToLogin
      });

      setCurrentUser(res);
      setActiveRole(roleToLogin);
      if (roleToLogin === 'student') {
        setStudentTab('menu');
      } else {
        setVendorTab('dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'student') {
      handleLogin('student', studentId, studentPassword);
    } else {
      handleLogin('vendor', vendorId, vendorPassword);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-fadeIn">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
            🍛
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Who are you?</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Select your role to access the CampusBite pre-order and smart queue management system.
          </p>
        </div>

        {/* Role Selection Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            id="student-tab-btn"
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setErrorMsg('');
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'student'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            id="vendor-tab-btn"
            type="button"
            onClick={() => {
              setSelectedRole('vendor');
              setErrorMsg('');
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'vendor'
                ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Vendor Login</span>
          </button>
        </div>

        {/* Demo Credentials Box */}
        {selectedRole === 'student' ? (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                STUDENT DEMO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Working Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-300">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Student ID:</span>
                <strong className="text-amber-300">STU001</strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Password:</span>
                <strong className="text-amber-300">student123</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Name: <strong>Arun Kumar</strong> • Student ID: <strong>STU001</strong>
            </p>

            <button
              id="student-quick-login-btn"
              type="button"
              onClick={() => handleLogin('student', 'STU001', 'student123')}
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Login as Student (STU001)</span>
            </button>
          </div>
        ) : (
          <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                VENDOR DEMO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Working Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-300">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Vendor ID:</span>
                <strong className="text-indigo-300">VEN001</strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Password:</span>
                <strong className="text-indigo-300">vendor123</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Canteen: <strong>Campus Central Canteen</strong> • Vendor ID: <strong>VEN001</strong>
            </p>

            <button
              id="vendor-quick-login-btn"
              type="button"
              onClick={() => handleLogin('vendor', 'VEN001', 'vendor123')}
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Login as Vendor (VEN001)</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3 pt-1 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Or Sign In with Form:
          </div>

          {selectedRole === 'student' ? (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Student ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="e.g. student123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Student'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Vendor ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    placeholder="e.g. VEN001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    placeholder="e.g. vendor123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Vendor'}</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
