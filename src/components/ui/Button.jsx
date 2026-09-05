import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 border border-amber-400/30 active:scale-[0.98]',
  secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 hover:border-slate-600 font-semibold shadow-sm active:scale-[0.98]',
  danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-semibold hover:shadow-lg hover:shadow-rose-500/10 active:scale-[0.98]',
  success: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white font-medium',
  outline: 'bg-transparent border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400 font-semibold active:scale-[0.98]',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-2xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-sans tracking-wide
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 focus:ring-offset-slate-900
        ${fullWidth ? 'w-full' : ''}
        ${variantClass}
        ${sizeClass}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none active:scale-100 shadow-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
