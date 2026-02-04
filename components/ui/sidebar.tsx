'use client';

import React from 'react';

// Updated Sidebar to handle mobile (bottom bar) and desktop (left sidebar)
export const Sidebar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <aside className={`w-full md:w-96 bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-col z-[60] fixed bottom-0 md:sticky md:top-0 h-auto md:h-screen shrink-0 transition-all duration-300 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl ${className}`} {...props}>
    {children}
  </aside>
);

// SidebarHeader can be condensed on mobile
export const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`h-12 md:h-[72px] border-b border-slate-100 flex items-center px-4 md:px-6 justify-between shrink-0 bg-white ${className}`} {...props}>
    {children}
  </div>
);

// SidebarContent: Switch to horizontal scroll on mobile for card stacks
export const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`flex-1 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto py-3 md:py-6 px-4 flex flex-row md:flex-col gap-4 no-scrollbar scroll-smooth snap-x ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-3 md:p-4 border-t border-slate-100 shrink-0 bg-white/95 backdrop-blur-sm ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroup: React.FC<{ label?: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={`flex-1 flex flex-col md:space-y-3 ${className}`}>
    {label && <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">{label}</p>}
    <div className="flex flex-row md:flex-col gap-3 h-full">
      {children}
    </div>
  </div>
);
