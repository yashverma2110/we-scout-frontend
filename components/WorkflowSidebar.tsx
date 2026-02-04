'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { StrategyCategory, ResearchSource, WorkflowState, SavedMission } from '@/types';
import { STRATEGY_METADATA, SOURCE_ICONS } from '@/constants';
import { Layout, Code, Wand2, ChevronRight, AlertCircle, History, Plus, Save, Trash2, FileText, Target, ShieldAlert, GripVertical } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface WorkflowSidebarProps {
  workflow: WorkflowState;
  savedMissions: SavedMission[];
  loading: boolean;
  showConfig: boolean;
  onToggleConfig: () => void;
  onToggleCategory: (cat: StrategyCategory) => void;
  onToggleSource: (cat: StrategyCategory, source: ResearchSource) => void;
  onGenerate: () => void;
  onLoadMission: (mission: SavedMission) => void;
  onCreateNew: () => void;
  onDeleteMission: (id: string) => void;
  isFormValid: boolean;
  getDraftConfig: () => any;
}

const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  workflow,
  savedMissions,
  loading,
  showConfig,
  onToggleConfig,
  onToggleCategory,
  onToggleSource,
  onGenerate,
  onLoadMission,
  onCreateNew,
  onDeleteMission,
  isFormValid,
  getDraftConfig
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'history'>('config');
  const toast = useToast();
  const isPhasesEmpty = workflow.activeCategories.length === 0;
  const isButtonDisabled = !isFormValid || loading || isPhasesEmpty || workflow.missionStatus === 'published';

  const handleDragStart = (e: React.DragEvent, category: StrategyCategory) => {
    if (!isFormValid) {
      e.preventDefault();
      toast.warning("Please define your Scout Objective before adding research phases.");
      return;
    }
    
    // We no longer block drag start here if the category is already active.
    // This allows the user to drag the handle naturally, and the handleDrop 
    // will handle logic for whether to slate it or inject it into the canvas.

    e.dataTransfer.setData('strategyCategory', category);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback for the drag
    const cardElement = (e.currentTarget as HTMLElement).closest('.group\/card');
    if (cardElement) {
      cardElement.classList.add('opacity-50');
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const cardElement = (e.currentTarget as HTMLElement).closest('.group\/card');
    if (cardElement) {
      cardElement.classList.remove('opacity-50');
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <Layout className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col md:block">
            <span className="font-bold text-slate-900 tracking-tight text-sm md:text-lg">Workflow Builder</span>
            <span className="md:hidden text-[9px] text-slate-400 font-bold uppercase tracking-wider">Configure Phases</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('config')} 
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${activeTab === 'config' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Layout className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${activeTab === 'history' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <History className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {activeTab === 'config' ? (
          <SidebarGroup label="Step Configuration">
            <div className="mb-2 px-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                <GripVertical className="w-3 h-3" /> Use handle to drag to canvas
              </p>
            </div>
            {(Object.entries(STRATEGY_METADATA) as [StrategyCategory, typeof STRATEGY_METADATA[StrategyCategory]][]).map(([id, meta]) => {
              const Icon = meta.icon;
              const category = id as StrategyCategory;
              const isActive = workflow.activeCategories.includes(category);
              const activeSources = workflow.probeSources[category];

              return (
                <Card 
                  key={id}
                  className={`flex-shrink-0 w-[240px] md:w-auto snap-center transition-all duration-300 overflow-hidden relative group/card ${
                    isActive 
                      ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50 bg-white opacity-100' 
                      : 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-90'
                  } ${workflow.missionStatus === 'published' ? 'pointer-events-none' : ''}`}
                >
                  <div className="p-3 md:p-4 flex flex-row items-start gap-3 md:gap-4 relative">
                    {/* Drag Handle - Only part that is draggable */}
                    <div 
                      draggable={workflow.missionStatus !== 'published'}
                      onDragStart={(e) => handleDragStart(e, category)}
                      onDragEnd={handleDragEnd}
                      className="absolute top-2 left-1 p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-400 transition-colors rounded-md hover:bg-slate-100"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <button 
                      onClick={() => onToggleCategory(category)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-300 ${isActive ? meta.color : 'bg-slate-300'} mt-0.5 ml-2`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 pr-6 md:pr-8">
                      <p className="text-[10px] md:text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{meta.name}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-1 md:line-clamp-2">{meta.desc}</p>
                    </div>

                    <button
                      onClick={() => onToggleCategory(category)}
                      className={`absolute top-3 right-3 md:top-4 md:right-4 w-7 h-4 md:w-9 md:h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 md:w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out transform ${
                        isActive ? 'translate-x-4 md:translate-x-5' : 'translate-x-0.5 md:translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {isActive && (
                    <CardContent className="p-3 md:p-4 pt-0 animate-in slide-in-from-top-1 duration-300">
                      <div className="pt-2 md:pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {(Object.entries(SOURCE_ICONS) as [ResearchSource, typeof SOURCE_ICONS[ResearchSource]][]).map(([sKey, sMeta]) => {
                            const SIcon = sMeta.icon;
                            const isConnected = activeSources.includes(sKey);
                            const isGloballyEnabled = workflow.enabledSources.includes(sKey);
                            
                            if (!isGloballyEnabled) return null;

                            return (
                              <Tooltip 
                                key={sKey} 
                                content={
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-[10px]">{sMeta.label}</span>
                                    <span className="text-slate-400 text-[9px]">{sMeta.description}</span>
                                  </div>
                                }
                              >
                                <button
                                  onClick={() => onToggleSource(category, sKey)}
                                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg border transition-all duration-300 ${
                                    isConnected 
                                      ? `bg-white border-indigo-200 shadow-sm ${sMeta.color}` 
                                      : 'bg-slate-50 border-transparent text-slate-300 hover:border-slate-200'
                                    }`}
                                  >
                                    <SIcon className="w-3 h-3 md:w-4 md:h-4" />
                                  </button>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </SidebarGroup>
        ) : (
          <SidebarGroup label="Mission Archive">
            <button 
              onClick={onCreateNew}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">New Scout Mission</span>
              </div>
            </button>
            
            <div className="space-y-4">
              {savedMissions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <FileText className="w-8 h-8 text-slate-200 mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No missions saved yet. Initialize one on the canvas.</p>
                </div>
              ) : (
                savedMissions.map((mission) => (
                  <Card 
                    key={mission.id} 
                    className={`group relative hover:shadow-md transition-all cursor-pointer overflow-hidden ${workflow.activeMissionId === mission.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                    onClick={() => onLoadMission(mission)}
                  >
                    <div className={`h-1 w-full ${mission.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-slate-900 truncate">
                            {mission.productDetails.productName || mission.productDetails.nicheName || 'Untitled Mission'}
                          </span>
                          {mission.productDetails.featureName && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Target className="w-2.5 h-2.5 text-indigo-500" />
                              <span className="text-[9px] font-bold text-indigo-600 truncate">
                                {mission.productDetails.featureName}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className={`shrink-0 text-[8px] uppercase tracking-tighter py-0 ${mission.status === 'published' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-amber-200 text-amber-600 bg-amber-50'}`}>
                          {mission.status === 'published' ? mission.versionId : 'Draft'}
                        </Badge>
                      </div>

                      {mission.productDetails.description && (
                        <div className="text-[10px] text-slate-500 line-clamp-2 leading-snug font-medium italic bg-slate-50/50 p-2 rounded-lg border border-slate-100/50 overflow-hidden prose prose-xs prose-slate max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {mission.productDetails.description}
                          </ReactMarkdown>
                        </div>
                      )}

                      {mission.productDetails.problemsToSolve && mission.productDetails.problemsToSolve.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {mission.productDetails.problemsToSolve.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 rounded-md border border-rose-100">
                               <ShieldAlert className="w-2 h-2 text-rose-500" />
                               <span className="text-[8px] font-bold text-rose-600 truncate max-w-[80px]">{p}</span>
                            </div>
                          ))}
                          {mission.productDetails.problemsToSolve.length > 2 && (
                            <span className="text-[8px] text-slate-400 font-black self-center ml-0.5">+{mission.productDetails.problemsToSolve.length - 2} more</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
                        <p className="text-[9px] text-slate-400 font-medium">
                          {new Date(mission.timestamp).toLocaleDateString()}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteMission(mission.id); }}
                          className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      {showConfig && activeTab === 'config' && (
        <div className="hidden md:block h-64 border-t border-slate-100 bg-slate-900 p-4 overflow-auto animate-in slide-in-from-bottom-2">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Live Protocol Config
          </p>
          <pre className="text-[10px] text-slate-400 font-mono text-xs">
            {JSON.stringify(getDraftConfig(), null, 2)}
          </pre>
        </div>
      )}

      <SidebarFooter>
         <div className="space-y-3">
           <Button 
              className={`w-full rounded-xl md:rounded-[1.2rem] h-10 md:h-14 shadow-xl text-xs md:text-base font-bold transition-all ${isButtonDisabled ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-white hover:scale-[1.01] active:scale-[0.98]'}`} 
              disabled={isButtonDisabled}
              onClick={onGenerate}
              loading={loading}
            >
              Orchestrate Workflow <Wand2 className="ml-2 md:ml-3 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            
            {workflow.missionStatus === 'published' && (
              <div className="flex items-center justify-center gap-2 px-2 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <FileText className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Mission Published & Locked</span>
              </div>
            )}

            {isButtonDisabled && !loading && workflow.missionStatus !== 'published' && (
              <div className="flex items-center justify-center gap-2 px-2 animate-in fade-in duration-500">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">
                  {isPhasesEmpty ? "Select at least one phase" : !isFormValid ? "Missing required product details" : ""}
                </span>
              </div>
            )}
         </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default WorkflowSidebar;
