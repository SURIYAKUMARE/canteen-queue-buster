import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { MessageSquare, Bell, CheckCircle2, X, Smartphone } from 'lucide-react';

export default function NotificationModal() {
  const { notification, setNotification } = useCanteen();

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-xl shadow-2xl p-4 text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">SIMULATED SMS / WHATSAPP</span>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">DELIVERED</span>
              </div>
              <p className="text-[11px] text-slate-400">To: {notification.phone || '+91 98765 43210'}</p>
            </div>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message bubble preview */}
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-100 font-sans space-y-1">
          <div className="flex items-center gap-1 font-bold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Canteen Alert: Order Ready!</span>
          </div>
          <p className="leading-relaxed">
            Your pre-order <strong className="text-white font-mono">{notification.token}</strong> is freshly packed and ready at <strong className="text-amber-300">{notification.bay || 'Bay 1'}</strong>!
          </p>
          <div className="flex items-center justify-between text-[10px] text-emerald-400/80 pt-1 border-t border-emerald-800/40 font-mono">
            <span>Scheduled Slot: {notification.slot}</span>
            <span>Just now ✓✓</span>
          </div>
        </div>

        <div className="mt-2 text-[10px] text-slate-400 text-center">
          Mock simulated alert (Zero paid SMS gateway needed for viva demo)
        </div>
      </div>
    </div>
  );
}
