import React from 'react';
import { useCampus } from '../context/CampusContext';
import { Bell, CheckCircle2, Clock, X, ChefHat, Sparkles } from 'lucide-react';

export default function NotificationToaster() {
  const { notifications, activeRole } = useCampus();

  // Show recent 3 notifications relevant to the active role
  const relevantNotifs = notifications.filter(n => 
    activeRole === 'split' ? true : n.targetRole === activeRole
  ).slice(0, 2);

  if (!relevantNotifs.length) return null;

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {relevantNotifs.map(n => (
        <div 
          key={n.id}
          className="pointer-events-none bg-slate-900/95 border border-amber-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white flex items-start gap-3 animate-slide-down transition"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/40">
            {n.type === 'ready' || n.type === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : n.type === 'preparing' ? (
              <ChefHat className="w-4 h-4 text-amber-400" />
            ) : (
              <Bell className="w-4 h-4 text-orange-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h5 className="font-bold text-xs text-white truncate">{n.title}</h5>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
