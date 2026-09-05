import React from 'react';
import { GraduationCap, ChefHat, ShieldAlert, ArrowRight } from 'lucide-react';

export default function StartScreen({ onSelectRole }) {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 text-white animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8 backdrop-blur-xl relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-amber-500/25 border-2 border-amber-400/30">
            🍛
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              CAMPUSBITE
            </h1>
            <p className="text-xs font-semibold text-amber-400 tracking-wide mt-0.5">
              Smart College Canteen
            </p>
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px bg-slate-800 flex-1" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
              Continue as
            </span>
            <span className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Role Choice Buttons */}
          <div className="space-y-3.5">
            {/* STUDENT BUTTON */}
            <button
              id="start-student-btn"
              onClick={() => onSelectRole('student_login')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 flex items-center justify-between transition-all transform active:scale-[0.98] border border-amber-300/30 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-slate-950" />
                </div>
                <span className="font-extrabold text-base">STUDENT</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* VENDOR BUTTON */}
            <button
              id="start-vendor-btn"
              onClick={() => onSelectRole('vendor_login')}
              className="w-full py-4 px-6 rounded-2xl bg-slate-950 hover:bg-slate-850 text-white font-black text-sm tracking-wider uppercase shadow-xl border-2 border-indigo-500/50 hover:border-indigo-400 flex items-center justify-between transition-all transform active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-extrabold text-base text-indigo-300">VENDOR</span>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Isolated System Owner / Admin Link */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            id="admin-portal-link"
            onClick={() => onSelectRole('admin_portal')}
            className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-lg hover:bg-slate-800/50 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>System Owner / Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
