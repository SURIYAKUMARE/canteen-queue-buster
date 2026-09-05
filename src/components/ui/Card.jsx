import React from 'react';

const VARIANTS = {
  default: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl',
  interactive: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer rounded-2xl',
  elevated: 'bg-slate-900/95 backdrop-blur-xl border border-amber-500/20 shadow-2xl shadow-black/60 rounded-2xl',
  glass: 'bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl',
  flat: 'bg-slate-900/40 border border-slate-800/50 rounded-2xl',
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <div
      onClick={onClick}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = ''
}) {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-800/60 flex items-center justify-between gap-3 ${className}`}>
      {children ? (
        children
      ) : (
        <>
          <div className="min-w-0">
            {title && <h3 className="font-bold text-base text-white truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </>
      )}
    </div>
  );
}

export function CardBody({
  children,
  className = ''
}) {
  return (
    <div className={`p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = ''
}) {
  return (
    <div className={`p-4 sm:p-5 border-t border-slate-800/60 flex items-center justify-between gap-3 bg-slate-950/20 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
}
