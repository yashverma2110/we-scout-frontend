'use client';

import React from 'react';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResearchSource, WorkflowState } from '@/types';
import { SOURCE_ICONS } from '@/constants';
import { Settings, X, Power } from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowState;
  onToggleSource: (source: ResearchSource) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isOpen,
  onClose,
  workflow,
  onToggleSource
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent Backdrop to emphasize floating state and allow closing on click-outside */}
      <div 
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[85] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Floating Right Sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white z-[90] flex flex-col shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] border-l border-slate-200 animate-in slide-in-from-right duration-300 ease-out">
        <SidebarHeader className="border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/10">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight">System Controls</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Global Configuration</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </SidebarHeader>

        <SidebarContent className="p-6 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Source Availability</p>
              <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 border-indigo-100">Live API</Badge>
            </div>
            
            <div className="space-y-3">
              {(Object.entries(SOURCE_ICONS) as [ResearchSource, typeof SOURCE_ICONS[ResearchSource]][]).map(([key, meta]) => {
                const Icon = meta.icon;
                const isEnabled = workflow.enabledSources.includes(key);
                const isPublished = workflow.missionStatus === 'published';

                return (
                  <Card 
                    key={key} 
                    className={`p-4 transition-all duration-300 border-slate-100 ${isEnabled ? 'bg-white shadow-sm' : 'bg-slate-50 opacity-60'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isEnabled ? 'bg-white border-slate-200 ' + meta.color : 'bg-slate-100 border-transparent text-slate-300'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>{meta.label}</span>
                          <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{meta.description}</span>
                        </div>
                      </div>

                      <button
                        disabled={isPublished}
                        onClick={() => onToggleSource(key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed ${
                          isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Rules</p>
             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Disabling a source globally will remove it from all active research phases in the current draft.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Published missions are locked and cannot have their data sources reconfigured.
                  </p>
                </div>
             </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-6 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
             <Power className="w-4 h-4 text-indigo-600" />
             <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">System Operational</p>
          </div>
        </SidebarFooter>
      </aside>
    </>
  );
};

export default SettingsSidebar;
