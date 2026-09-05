import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  GraduationCap, 
  ChefHat, 
  ShoppingBag, 
  Database,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function TopBar() {
  const { 
    activeRole, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    cartCount, 
    setIsCartOpen,
    currentUser,
    handleLogout,
    setSupabaseConfigModalOpen
  } = useCampus();

  // If not logged in, StartScreen/Login pages handle their own full-page UI
  if (!currentUser) return null;

  const isVendor = currentUser?.profile?.role === 'vendor' || activeRole === 'vendor';
  const isStudent = currentUser?.profile?.role === 'student' || activeRole === 'student';
  const isAdmin = currentUser?.profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-base sm:text-lg">
            🍛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">CampusBite</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
                {isSupabaseConfigured ? 'Supabase' : 'Local DB'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {isStudent ? 'Student Pre-Order & Digital Pickup Pass' : 'Canteen Vendor Operations & QR Scanner'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Vendor specific: Canteen Status Indicator */}
          {isVendor && (
            <button
              onClick={toggleCanteenStatus}
              title="Toggle Canteen Open/Closed Status"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                isCanteenOpen 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
            {isVendor ? (
              <ChefHat className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            {/* Mobile: compact badge */}
            <span className="sm:hidden font-mono font-bold text-xs text-white">
              {isVendor ? (currentUser.vendor?.vendor_id || 'VEN001') : isAdmin ? 'Admin' : (currentUser.student?.student_id || 'STU001')}
            </span>
            {/* Tablet/Desktop: full text */}
            <span className="hidden sm:inline max-w-[200px] truncate">
              {isVendor
                ? `${currentUser.vendor?.canteen_name || currentUser.profile?.full_name || 'Central Canteen'} (${currentUser.vendor?.vendor_id || 'VEN001'})`
                : isAdmin
                ? 'Admin / System Owner'
                : `${currentUser.profile?.full_name || 'Arun Kumar'} (${currentUser.student?.student_id || 'STU001'})`}
            </span>
          </div>

          {/* Cart Icon (Only for Students) */}
          {isStudent && (
            <button
              id="topbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer shrink-0"
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

          {/* Isolated Logout Button: clears session and returns to Start Screen */}
          <button
            id="switch-role-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            title="Log out and return to role selection start screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
