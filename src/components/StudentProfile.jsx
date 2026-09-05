import React, { useState } from 'react';
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
  ChevronRight,
  ShieldCheck,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './ui/ToastContext';

export default function StudentProfile() {
  const { studentUser, setStudentUser, setActiveRole, orders, handleLogout, currentUser } = useCampus();
  const { toast } = useToast();

  const [dietPref, setDietPref] = useState('any'); // 'any' | 'veg' | 'jain'

  const studentRoll = currentUser?.student?.student_id || studentUser.rollNo;
  const studentName = currentUser?.profile?.full_name || studentUser.name;
  const studentEmail = currentUser?.email || studentUser.email;
  const studentPhone = currentUser?.student?.phone || studentUser.phone;
  const completedOrdersCount = orders.filter(o => {
    const sId = o.student_id || o.studentId;
    const st = (o.order_status || o.orderStatus || '').toUpperCase();
    return (sId === studentRoll || !sId) && (st === 'COMPLETED' || st === 'COLLECTED');
  }).length;

  const handleAddMoney = (amount) => {
    setStudentUser(prev => ({
      ...prev,
      walletBalance: (prev.walletBalance || 0) + amount
    }));
    toast.success(`Wallet Recharged: +₹${amount} added successfully! 💳`);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>🎓 Student Profile & ID Card</span>
        </h2>
        <p className="text-xs text-slate-400">Manage your college credentials and campus dining wallet</p>
      </div>

      {/* College Smart ID Card Graphic */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">CAMPUS SMART ID</h4>
              <span className="text-[10px] text-indigo-300 font-mono">RFID PREPAID MEAL PASS</span>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
            VERIFIED
          </span>
        </div>

        {/* Student Data */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
            {studentName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="font-extrabold text-base text-white truncate">{studentName}</h3>
            <div className="text-xs text-slate-300 font-mono">
              Roll No: <strong className="text-amber-300 font-bold">{studentRoll}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              {studentUser.dept} • {studentUser.year}
            </div>
          </div>
        </div>

        {/* Wallet Balance Display & Quick Top-ups */}
        <div className="bg-slate-950/80 border border-indigo-900/40 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">DINING WALLET BALANCE</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ₹{studentUser.walletBalance}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Instant Counter Pay</span>
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Top-up:</span>
            <button
              onClick={() => handleAddMoney(50)}
              className="flex-1 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition active:scale-95"
            >
              +₹50
            </button>
            <button
              onClick={() => handleAddMoney(100)}
              className="flex-1 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition active:scale-95"
            >
              +₹100
            </button>
            <button
              onClick={() => handleAddMoney(200)}
              className="flex-1 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition active:scale-95"
            >
              +₹200
            </button>
          </div>
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
            <span className="font-mono text-white">{studentEmail}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Phone:</span>
            </span>
            <span className="font-mono text-white">{studentPhone}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-400">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Meals Completed:</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{completedOrdersCount} orders</span>
          </div>
        </div>
      </div>

      {/* Dietary Preference Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Dietary Preference</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setDietPref('any');
              toast.info('Diet preference: All items');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
              dietPref === 'any'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🍽️ All Items
          </button>
          <button
            type="button"
            onClick={() => {
              setDietPref('veg');
              toast.info('Diet preference: Pure Veg');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
              dietPref === 'veg'
                ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🌱 Pure Veg
          </button>
          <button
            type="button"
            onClick={() => {
              setDietPref('jain');
              toast.info('Diet preference: Jain Friendly');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
              dietPref === 'jain'
                ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🥗 Jain Meals
          </button>
        </div>
      </div>

      {/* Switch to Vendor View / Logout */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleLogout}
          className="w-full bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition border border-rose-900/40 cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Campus Account</span>
        </button>
      </div>
    </div>
  );
}
