'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="w-full space-y-8 mt-12 animate-in fade-in duration-700">
      {/* Visual indicator of orchestrator activity */}
      <div className="flex flex-col items-center gap-2 mb-4">
         <div className="w-px h-12 bg-gradient-to-b from-slate-100 to-indigo-500 animate-pulse" />
         <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10">
           Orchestrating Strategic Protocol...
         </div>
      </div>
      
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative overflow-hidden border-none shadow-lg rounded-[2.5rem] bg-white/60 p-8 md:p-10 border border-slate-50">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-100 animate-pulse" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-6 w-full">
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0 bg-slate-100" />
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16 rounded-full bg-slate-100" />
                  <Skeleton className="h-6 w-48 rounded-lg bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-md bg-slate-100" />
                  <Skeleton className="h-4 w-3/4 rounded-md bg-slate-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-2xl bg-slate-50/50" />
            <Skeleton className="h-12 w-full rounded-2xl bg-slate-50/50" />
          </div>
        </Card>
      ))}
      
      <div className="flex flex-col items-center justify-center pt-8 gap-3">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Consulting the market oracle...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
