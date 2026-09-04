import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ChefHat, 
  Store, 
  Clock, 
  IndianRupee, 
  ShoppingBag, 
  Mail, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function VendorProfile() {
  const { vendorUser, orders, setActiveRole, isCanteenOpen, toggleCanteenStatus } = useCampus();

  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const completedCount = orders.filter(o => o.orderStatus === 'COMPLETED').length;

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>👨‍🍳 Vendor Profile & Operations</span>
        </h2>
        <p className="text-xs text-slate-400">Canteen kitchen settings, counter bays and operating schedule</p>
      </div>

      {/* Vendor Identity Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider">
              AUTHORIZED CANTEEN OPERATOR
            </span>
            <h3 className="font-extrabold text-base text-white">{vendorUser.name}</h3>
            <p className="text-xs text-slate-400 font-mono">Operator ID: {vendorUser.id}</p>
          </div>
        </div>

        {/* Counter Info */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Assigned Counter:</span>
            <strong className="text-white font-mono">{vendorUser.counterBay}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Daily Operating Hours:</span>
            <strong className="text-white font-mono">{vendorUser.operatingHours}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Canteen Status:</span>
            <strong className={isCanteenOpen ? 'text-emerald-400' : 'text-rose-400'}>
              {isCanteenOpen ? 'OPEN (Accepting Orders)' : 'CLOSED'}
            </strong>
          </div>
        </div>
      </div>

      {/* Financial & Performance Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] text-slate-400 block font-mono">TOTAL REVENUE</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">₹{totalRevenue}</div>
          <span className="text-[10px] text-slate-500">Collected digitally</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] text-slate-400 block font-mono">MEALS DELIVERED</span>
          <div className="text-2xl font-black font-mono text-white mt-1">{completedCount}</div>
          <span className="text-[10px] text-slate-500">Via QR verification</span>
        </div>
      </div>

      {/* Switch role button */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => setActiveRole('student')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-between transition border border-slate-700"
        >
          <span>Switch to Student Pre-Order Mode</span>
          <ChevronRight className="w-4 h-4 text-orange-400" />
        </button>

        <button
          onClick={() => alert('Simulated vendor sign out.')}
          className="w-full bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition border border-rose-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Vendor Console</span>
        </button>
      </div>
    </div>
  );
}
