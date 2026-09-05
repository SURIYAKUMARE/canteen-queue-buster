import React from 'react';

const STATUS_VARIANTS = {
  // Order lifecycle states
  placed: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  preparing: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  ready: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm shadow-emerald-500/10',
  collected: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
  completed: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
  cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',

  // Dietary tags
  veg: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 font-medium',
  'non-veg': 'bg-rose-950/50 text-rose-400 border-rose-500/30 font-medium',
  nonveg: 'bg-rose-950/50 text-rose-400 border-rose-500/30 font-medium',

  // Semantic styles
  info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
};

const DOT_COLORS = {
  placed: 'bg-amber-400',
  pending: 'bg-amber-400',
  preparing: 'bg-sky-400 animate-ping',
  ready: 'bg-emerald-400',
  collected: 'bg-slate-500',
  completed: 'bg-slate-500',
  cancelled: 'bg-rose-400',
  veg: 'bg-emerald-500',
  'non-veg': 'bg-rose-500',
  nonveg: 'bg-rose-500',
  info: 'bg-cyan-400',
  warning: 'bg-amber-400',
  success: 'bg-emerald-400',
  danger: 'bg-rose-400',
  neutral: 'bg-slate-400',
  brand: 'bg-orange-400'
};

const SIZES = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded-md gap-1',
  sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  md: 'px-3 py-1.5 text-xs rounded-xl gap-2',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon = null,
  className = '',
  ...props
}) {
  const normalizedVariant = String(variant).toLowerCase();
  const variantClass = STATUS_VARIANTS[normalizedVariant] || STATUS_VARIANTS.neutral;
  const dotColor = DOT_COLORS[normalizedVariant] || 'bg-current';
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <span
      className={`
        inline-flex items-center font-medium border uppercase tracking-wider
        ${variantClass}
        ${sizeClass}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {normalizedVariant === 'preparing' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
