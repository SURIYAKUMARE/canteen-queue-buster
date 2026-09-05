import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function EmptyState({
  icon: Icon = UtensilsCrossed,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  action = null,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30
        ${compact ? 'py-8 px-4' : 'py-14 px-6'}
        ${className}
      `}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3.5 shadow-inner">
        {typeof Icon === 'function' ? <Icon className="w-7 h-7 text-amber-500/80" /> : Icon}
      </div>
      <h3 className="font-bold text-base text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
