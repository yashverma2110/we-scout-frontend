'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight">We Scout</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Strategist</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">API Connected</span>
          </div>
          <Badge variant="outline" className="text-[11px] font-bold border-slate-200 text-slate-600 px-2 py-0">
            v2.0
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default Header;
