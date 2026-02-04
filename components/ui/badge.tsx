'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  // Explicitly defining className to resolve TS recognition issues in some environments
  className?: string;
}

// Added comment above fix: Explicitly added className to BadgeProps interface and handled default value in destructuring
export const Badge = ({ className = '', variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    outline: "text-slate-950 border border-slate-200",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/80",
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className}`} {...props} />
  );
};
