import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    bg: 'bg-slate-900/95 border-emerald-500/40 text-white',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    progress: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-slate-900/95 border-rose-500/40 text-white',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: AlertCircle,
    progress: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-slate-900/95 border-amber-500/40 text-white',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
    progress: 'bg-amber-500',
  },
  info: {
    bg: 'bg-slate-900/95 border-sky-500/40 text-white',
    iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    icon: Info,
    progress: 'bg-sky-500',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = options.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const type = options.type || 'info';
    const duration = options.duration !== undefined ? options.duration : 4000;
    const title = options.title || null;

    const newToast = { id, message, type, title, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const toast = useCallback(
    (message, options) => addToast(message, options),
    [addToast]
  );

  toast.success = (message, options) => addToast(message, { ...options, type: 'success' });
  toast.error = (message, options) => addToast(message, { ...options, type: 'error' });
  toast.warning = (message, options) => addToast(message, { ...options, type: 'warning' });
  toast.info = (message, options) => addToast(message, { ...options, type: 'info' });
  toast.dismiss = dismiss;

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          const IconComponent = style.icon;

          return (
            <div
              key={t.id}
              role="alert"
              className={`
                pointer-events-auto border rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl
                flex items-start gap-3 transition-all duration-300 animate-slide-down
                ${style.bg}
              `}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${style.iconBg}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {t.title && (
                  <h5 className="text-xs font-bold leading-tight mb-0.5">{t.title}</h5>
                )}
                <p className="text-xs text-slate-200 leading-snug break-words">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe dummy implementation if called outside provider
    return {
      toast: Object.assign((msg) => console.log('Toast:', msg), {
        success: (msg) => console.log('Toast [success]:', msg),
        error: (msg) => console.error('Toast [error]:', msg),
        warning: (msg) => console.warn('Toast [warning]:', msg),
        info: (msg) => console.info('Toast [info]:', msg),
        dismiss: () => {},
      }),
      dismiss: () => {},
    };
  }
  return context;
}
