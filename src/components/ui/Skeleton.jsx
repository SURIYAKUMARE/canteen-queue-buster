import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'rounded', // 'rounded', 'circle', 'pill', 'rect'
  animate = 'pulse', // 'pulse', 'shimmer', 'none'
  width,
  height,
  ...props
}) {
  const variantClass = {
    circle: 'rounded-full',
    pill: 'rounded-full',
    rounded: 'rounded-xl',
    rect: 'rounded-none',
  }[variant] || 'rounded-xl';

  const animationClass = {
    pulse: 'animate-pulse bg-slate-800/80',
    shimmer: 'relative overflow-hidden bg-slate-800/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/30 before:to-transparent',
    none: 'bg-slate-800/80',
  }[animate] || 'animate-pulse bg-slate-800/80';

  return (
    <div
      className={`${variantClass} ${animationClass} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 2, className = '' }) {
  const widths = ['w-full', 'w-4/5', 'w-3/5', 'w-2/3'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${widths[i % widths.length]}`}
          variant="rounded"
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  return (
    <Skeleton
      variant="circle"
      className={`${sizeMap[size] || sizeMap.md} ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16" variant="pill" />
        <Skeleton className="h-9 w-24" variant="rounded" />
      </div>
    </div>
  );
}

export function SkeletonOrderRow({ className = '' }) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" className="w-10 h-10 shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16" variant="pill" />
        <Skeleton className="h-8 w-20" variant="rounded" />
      </div>
    </div>
  );
}
