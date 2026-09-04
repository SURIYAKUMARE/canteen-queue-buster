import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  GraduationCap, 
  ChefHat, 
  Columns2, 
  RotateCcw, 
  ShoppingBag, 
  Sparkles, 
  Clock,
  Store,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function TopBar() {
  const { 
    activeRole, 
    setActiveRole, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    cartCount, 
    setIsCartOpen,
    resetAllData,
    studentTab,
    setStudentTab,
    vendorTab,
    setVendorTab
  } = useCampus();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 font-black text-lg">
            🍛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">CampusBite</span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Smart Canteen
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              College Canteen Pre-Order & Smart QR Verification System
            </p>
          </div>
        </div>

        {/* Global Controls & Role Selector */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Canteen Status Indicator */}
          <button
            onClick={toggleCanteenStatus}
            title="Toggle Canteen Open/Closed Status"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
              isCanteenOpen 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>{isCanteenOpen ? 'Canteen OPEN' : 'Canteen CLOSED'}</span>
          </button>

          {/* Role Switcher Pills */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'student'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              onClick={() => setActiveRole('vendor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'vendor'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Vendor</span>
            </button>

            <button
              onClick={() => setActiveRole('split')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'split'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View Student and Vendor interfaces side-by-side"
            >
              <Columns2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Split Demo</span>
            </button>
          </div>

          {/* Cart Icon (Student view) */}
          {activeRole === 'student' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
              title="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center font-mono animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={resetAllData}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title="Reset to clean demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
