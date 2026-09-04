import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  GraduationCap, 
  ChefHat, 
  Columns2, 
  ShoppingBag, 
  Database,
  User,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function TopBar() {
  const { 
    activeRole, 
    setActiveRole, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    cartCount, 
    setIsCartOpen,
    currentUser,
    openAuthModal,
    handleLogout,
    setSupabaseConfigModalOpen
  } = useCampus();

  const userDisplayName = currentUser?.profile?.full_name || (activeRole === 'student' ? 'Rahul Sharma' : 'Central Canteen');

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-base sm:text-lg">
            🍛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">CampusBite</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
                Supabase
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              College Canteen Pre-Order & Smart QR Verification System
            </p>
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
          {/* Supabase Status Indicator Button */}
          <button
            onClick={() => setSupabaseConfigModalOpen(true)}
            title="Supabase Database Status & Configuration"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSupabaseConfigured ? 'Live DB' : 'Local DB'}</span>
          </button>

          {/* Canteen Status Indicator */}
          <button
            onClick={toggleCanteenStatus}
            title="Toggle Canteen Open/Closed Status"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
              isCanteenOpen 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="hidden sm:inline">{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          {/* Role Switcher Pills */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'student'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>

            <button
              onClick={() => setActiveRole('vendor')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'vendor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vendor</span>
            </button>

            <button
              onClick={() => setActiveRole('split')}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'split'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Screen Dual-Phone Presentation"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split Demo</span>
            </button>
          </div>

          {/* User Profile / Auth Button */}
          <button
            onClick={() => openAuthModal(activeRole === 'vendor' ? 'vendor' : 'student')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
            title="User Profile & Authentication"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline truncate max-w-[100px]">{userDisplayName}</span>
          </button>

          {/* Cart Icon (Student view) */}
          {activeRole === 'student' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
              title="Open Food Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
