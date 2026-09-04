import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  User, 
  CreditCard, 
  Wallet, 
  Plus, 
  Sparkles, 
  LogOut, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function StudentProfile() {
  const { studentUser, setStudentUser, setActiveRole, orders } = useCampus();

  const completedOrdersCount = orders.filter(o => o.orderStatus === 'COMPLETED').length;

  const handleAddMoney = (amount = 100) => {
    setStudentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount
    }));
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>🎓 Student Profile & ID Card</span>
        </h2>
        <p className="text-xs text-slate-400">Manage your college credentials and campus RFID dining wallet</p>
      </div>

      {/* College Smart ID Card Graphic */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">CAMPUS SMART ID</h4>
              <span className="text-[10px] text-indigo-300 font-mono">RFID DIGITAL WALLET</span>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
            ACTIVE
          </span>
        </div>

        {/* Student Data */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            {studentUser.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="font-extrabold text-base text-white truncate">{studentUser.name}</h3>
            <div className="text-xs text-slate-300 font-mono">
              Roll No: <strong className="text-amber-300 font-bold">{studentUser.rollNo}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              {studentUser.dept} • {studentUser.year}
            </div>
          </div>
        </div>

        {/* Wallet Balance Display */}
        <div className="bg-slate-950/80 border border-indigo-900/40 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">PREPAID DINING BALANCE</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{studentUser.walletBalance}
            </div>
          </div>

          <button
            onClick={() => handleAddMoney(100)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-md active:scale-95"
            title="Simulate adding ₹100 to wallet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ₹100</span>
          </button>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Contact & Records</h4>

        <div className="space-y-2 text-slate-300">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span>College Email:</span>
            </span>
            <span className="font-mono text-white">{studentUser.email}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Phone:</span>
            </span>
            <span className="font-mono text-white">{studentUser.phone}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-400">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Meals Ordered:</span>
            </span>
            <span className="font-mono text-white font-bold">{completedOrdersCount} orders</span>
          </div>
        </div>
      </div>

      {/* Switch to Vendor View / Logout */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => setActiveRole('vendor')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-between transition border border-slate-700"
        >
          <span>Switch to Canteen Vendor Hub</span>
          <ChevronRight className="w-4 h-4 text-orange-400" />
        </button>

        <button
          onClick={() => alert('Simulated student logout. Logging back in with default demo student credentials.')}
          className="w-full bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition border border-rose-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Student Account</span>
        </button>
      </div>
    </div>
  );
}
