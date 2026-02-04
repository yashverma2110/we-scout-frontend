'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WorkflowSidebar from '@/components/WorkflowSidebar';
import SettingsSidebar from '@/components/SettingsSidebar';
import ProblemListInput from '@/components/ProblemListInput';
import InsightCard from '@/components/InsightCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TooltipProvider, Tooltip } from '@/components/ui/tooltip';
import { 
  Rocket, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Loader2, 
  Cpu, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Copy, 
  FileCheck,
  Mic,
  MicOff,
  AlertCircle,
  HelpCircle,
  Save,
  CheckCircle2,
  Lock,
  RotateCcw,
  XCircle,
  Eye,
  Edit3,
  Settings,
  DownloadCloud
} from 'lucide-react';
import { WorkflowState, StrategyCategory, ResearchSource, SavedMission, MissionStatus } from '@/types';
import { STRATEGY_METADATA } from '@/constants';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { parseVoiceTranscript } from '@/services/geminiService';
import { useToast } from '@/context/ToastContext';

const FALLBACK_META = {
  name: 'Scout Phase',
  icon: HelpCircle,
  color: 'bg-slate-500',
  desc: 'Strategic intelligence gathering phase.',
  defaultSources: ['google'] as ResearchSource[]
};

function encode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function decode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: decode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface ResearchCanvasProps {
  workflow: WorkflowState;
  savedMissions: SavedMission[];
  loading: boolean;
  onBack: () => void;
  setField: (field: keyof WorkflowState, value: any) => void;
  toggleCategory: (cat: StrategyCategory) => void;
  toggleSource: (cat: StrategyCategory, source: ResearchSource) => void;
  toggleGlobalSource: (source: ResearchSource) => void;
  handleGenerate: () => void;
  runResearch: (query: string) => Promise<any>;
  executeFullDeepDive: () => void;
  cancelDeepDive: () => void;
  deleteStep: (index: number) => void;
  moveStep: (index: number, direction: 'up' | 'down') => void;
  addStepAt: (index: number, category: StrategyCategory) => void;
  saveMission: (status: MissionStatus) => void;
  loadMission: (mission: SavedMission) => void;
  createNewMission: () => void;
  deleteSavedMission: (id: string) => void;
}

const ResearchCanvas: React.FC<ResearchCanvasProps> = ({
  workflow,
  savedMissions,
  loading,
  onBack,
  setField,
  toggleCategory,
  toggleSource,
  toggleGlobalSource,
  handleGenerate,
  runResearch,
  executeFullDeepDive,
  cancelDeepDive,
  deleteStep,
  moveStep,
  addStepAt,
  saveMission,
  loadMission,
  createNewMission,
  deleteSavedMission
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const isFormValid = workflow.objective === 'new_product' 
    ? (workflow.nicheName.trim().length > 0 && workflow.description.trim().length > 0)
    : (workflow.productName.trim().length > 0 && workflow.featureName.trim().length > 0 && workflow.description.trim().length > 0);

  const handleDragOver = (e: React.DragEvent) => {
    if (workflow.missionStatus === 'published') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (workflow.missionStatus === 'published') return;
    e.preventDefault();
    setIsDraggingOver(false);
    
    const category = e.dataTransfer.getData('strategyCategory') as StrategyCategory;
    if (category) {
      const meta = STRATEGY_METADATA[category] || FALLBACK_META;
      const isAlreadyActive = workflow.activeCategories.includes(category);
      
      // Case 1: Workflow plan already exists on canvas
      if (workflow.config) {
        const isAlreadyInConfig = workflow.config.steps.some(s => s.probe === category);
        if (isAlreadyInConfig) {
          toast.info(`${meta.name} is already in your mission protocol.`);
          return;
        }
        
        // Inject into existing protocol at the end
        addStepAt(workflow.config.steps.length, category);
        
        // Also ensure it's marked as active in global sidebar state
        if (!isAlreadyActive) {
          toggleCategory(category);
        }
        toast.success(`Injected ${meta.name} into mission protocol.`);
      } 
      // Case 2: Still in planning stage (Mission Form visible)
      else {
        if (isAlreadyActive) {
          toast.info(`${meta.name} is already slated for your workflow.`);
          return;
        }
        toggleCategory(category);
        toast.success(`Slated ${meta.name} for mission orchestration.`);
      }
    }
  };

  const startListening = async () => {
    if (workflow.missionStatus === 'published') return;
    try {
      setVoiceTranscript('');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsListening(true);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setVoiceTranscript(prev => prev + text);
            }
          },
          onerror: (e) => {
            console.error("Voice Error", e);
            toast.error("Voice capture failed. Please check your microphone.");
          },
          onclose: () => setIsListening(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice capture", err);
      toast.error("Could not access microphone.");
    }
  };

  const stopListening = async () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);

    if (voiceTranscript.trim()) {
      setIsProcessingVoice(true);
      try {
        const extracted = await parseVoiceTranscript(voiceTranscript);
        if (extracted.objective) setField('objective', extracted.objective);
        if (extracted.productName) setField('productName', extracted.productName);
        if (extracted.nicheName) setField('nicheName', extracted.nicheName);
        if (extracted.description) setField('description', extracted.description);
        if (extracted.problemsToSolve) setField('problemsToSolve', extracted.problemsToSolve);
        toast.success("Voice intel extracted successfully.");
      } catch(e) {
        toast.error("Failed to process voice transcript.");
      } finally {
        setIsProcessingVoice(false);
      }
    }
  };

  const handleCancelDeepDive = () => {
    cancelDeepDive();
    toast.warning("Deep dive aborted by user.");
  };

  const handleSaveDraft = () => {
    if (!isFormValid) {
      toast.error("Please fill in all required product fields before saving.");
      return;
    }
    saveMission('draft');
    toast.success("Mission Draft Saved Successfully");
  };

  const handlePublish = () => {
    if (!isFormValid) {
      toast.error("Please fill in all required product fields before publishing.");
      return;
    }
    if (window.confirm("Publishing this mission will lock all configuration. You will only be able to view and execute it. Proceed?")) {
      saveMission('published');
      toast.success("Mission Published & Locked");
    }
  };

  const copyMarkdown = () => {
    if (!workflow.reportContent) return;
    navigator.clipboard.writeText(workflow.reportContent);
    toast.info("Markdown copied to clipboard");
  };

  const copyForGoogleDocs = () => {
    if (!reportRef.current) return;
    const range = document.createRange();
    range.selectNode(reportRef.current);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      toast.success("Report copied for Google Docs");
    }
  };

  const StepInsertionPoint = ({ index }: { index: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (workflow.missionStatus === 'published') return null;

    return (
      <div className="relative group/insert flex justify-center h-4 items-center -my-2 z-20">
        <div className="absolute inset-x-0 h-[2px] bg-indigo-100 opacity-0 group-hover/insert:opacity-100 transition-opacity" />
        <button onClick={() => setIsOpen(!isOpen)} className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-600 hover:scale-110 transition-all shadow-sm z-10">
          <Plus className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute top-10 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 z-30 animate-in zoom-in-95 min-w-[280px]">
            {(Object.entries(STRATEGY_METADATA) as [StrategyCategory, typeof STRATEGY_METADATA[StrategyCategory]][]).map(([id, meta]) => (
              <button key={id} onClick={() => { addStepAt(index, id as StrategyCategory); setIsOpen(false); toast.info(`Added ${meta.name} phase`); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-left">
                <div className={`w-8 h-8 rounded-lg ${meta.color} flex items-center justify-center text-white shrink-0`}><meta.icon className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-xs font-bold text-slate-800">{meta.name}</p></div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-x-hidden text-slate-900">
        <WorkflowSidebar 
          workflow={workflow} 
          savedMissions={savedMissions}
          loading={loading} 
          showConfig={showConfig} 
          onToggleConfig={() => setShowConfig(!showConfig)}
          onToggleCategory={toggleCategory} 
          onToggleSource={toggleSource} 
          onGenerate={handleGenerate}
          onLoadMission={loadMission}
          onCreateNew={createNewMission}
          onDeleteMission={deleteSavedMission}
          isFormValid={isFormValid} 
          getDraftConfig={() => workflow}
        />
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 canvas-grid relative overflow-y-auto h-screen pb-40 transition-colors duration-300 ${isDraggingOver ? 'bg-indigo-50/50' : ''}`}
        >
          {/* Drop Overlay Indicator */}
          {isDraggingOver && (
            <div className="fixed inset-0 z-[75] flex items-center justify-center pointer-events-none p-12">
               <div className="w-full max-w-4xl h-[80vh] border-4 border-dashed border-indigo-300 rounded-[3rem] bg-indigo-50/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in-95">
                  <DownloadCloud className="w-16 h-16 text-indigo-500 mb-6 animate-bounce" />
                  <p className="text-2xl font-black text-indigo-700 uppercase tracking-widest">Drop Phase to Canvas</p>
                  <p className="text-indigo-400 font-bold mt-2">Inject strategic intelligence into mission protocol</p>
               </div>
            </div>
          )}

          {/* Floating Settings Trigger */}
          <div className="fixed top-6 right-6 z-[80]">
            <Tooltip content="System Controls">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-12 h-12 rounded-2xl bg-white border-slate-200 shadow-xl hover:scale-110 transition-all ${isSettingsOpen ? 'text-indigo-600 border-indigo-200 ring-4 ring-indigo-50' : 'text-slate-600'}`}
              >
                <Settings className={`w-5 h-5 ${isSettingsOpen ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
          </div>

          <SettingsSidebar 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            workflow={workflow}
            onToggleSource={toggleGlobalSource}
          />

          {workflow.isExecutingAuto && (
            <div className="sticky top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-indigo-100 px-6 md:px-12 py-3 flex items-center gap-4 md:gap-6 animate-in slide-in-from-top-full">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-500 rounded-full" style={{ width: `${workflow.overallProgress}%` }} />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-black text-indigo-600">{workflow.overallProgress}%</span>
                <Button 
                  onClick={handleCancelDeepDive} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 p-12">
            <div className="w-full text-center space-y-4 pt-12">
               <div className="flex items-center justify-center gap-2 mb-2">
                 <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">Strategic Canvas</Badge>
                 {workflow.missionStatus === 'published' ? (
                   <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px] flex items-center gap-2">
                     <Lock className="w-3 h-3" /> Published v{workflow.activeMissionId?.slice(-4)}
                   </Badge>
                 ) : (
                   <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px] flex items-center gap-2">
                     Draft Session
                   </Badge>
                 )}
               </div>
               
               <h2 className="text-4xl font-black text-slate-900">
                 {workflow.missionStatus === 'published' ? 'Mission Intelligence Fold' : 'Define Your Scout Objective'}
               </h2>
               
               <div className="flex items-center justify-center gap-4 mt-4">
                 <button onClick={onBack} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                   <ChevronRight className="w-3 h-3 rotate-180" /> Back to Intelligencefold
                 </button>
                 <div className="h-4 w-[1px] bg-slate-200" />
                 {workflow.missionStatus !== 'published' && (
                   <button 
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${isListening ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}
                   >
                     {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                     {isListening ? 'Stop Listening' : 'Talk to Scout'}
                   </button>
                 )}
               </div>
            </div>

            <div className="w-full flex justify-end gap-3 -mb-8">
              {workflow.missionStatus === 'draft' && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={handleSaveDraft} 
                    disabled={!isFormValid}
                    className={`text-[10px] uppercase tracking-widest font-black transition-all ${!isFormValid ? 'text-slate-300' : 'text-slate-500 hover:text-indigo-600'}`}
                  >
                    <Save className="w-3.5 h-3.5 mr-2" /> Save Draft
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handlePublish} 
                    disabled={!isFormValid}
                    className={`text-[10px] uppercase tracking-widest font-black transition-all ${!isFormValid ? 'border-slate-100 text-slate-300' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Publish Mission
                  </Button>
                </>
              )}
            </div>

            {isListening && (
              <Card className="w-full bg-white border-2 border-indigo-500 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="flex items-center justify-center gap-1.5 h-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                       Listening for Intel...
                    </p>
                    <p className="text-slate-900 text-2xl font-bold leading-relaxed italic line-clamp-2">
                      {voiceTranscript || "Tell Scout about your idea or pain point..."}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {isProcessingVoice && (
              <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Voice Intel...</span>
              </div>
            )}

            <Card className={`w-full border-none shadow-xl rounded-[2.5rem] p-8 space-y-8 bg-white/70 backdrop-blur-sm relative ${workflow.missionStatus === 'published' ? 'opacity-80' : ''}`}>
                 {workflow.missionStatus === 'published' && (
                   <div className="absolute top-8 right-8 text-slate-300">
                     <Lock className="w-5 h-5" />
                   </div>
                 )}
                 <div className="space-y-4">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">1. Research Intent</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setField('objective', 'new_product')} 
                        disabled={workflow.missionStatus === 'published'}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${workflow.objective === 'new_product' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-50 hover:border-indigo-100'} disabled:opacity-100 disabled:cursor-not-allowed`}
                      >
                        <Rocket className={`w-5 h-5 ${workflow.objective === 'new_product' ? 'text-indigo-600' : 'text-slate-300'}`} />
                        <span className="font-bold text-slate-800">New Idea Scout</span>
                      </button>
                      <button 
                        onClick={() => setField('objective', 'improve_feature')} 
                        disabled={workflow.missionStatus === 'published'}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${workflow.objective === 'improve_feature' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-50 hover:border-indigo-100'} disabled:opacity-100 disabled:cursor-not-allowed`}
                      >
                        <Sparkles className={`w-5 h-5 ${workflow.objective === 'improve_feature' ? 'text-indigo-600' : 'text-slate-300'}`} />
                        <span className="font-bold text-slate-800">Feature Optimize</span>
                      </button>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">2. Core Product Idea</label>
                   
                   <div className="grid grid-cols-1 gap-6">
                      {workflow.objective === 'new_product' ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Niche Name *</span>
                            </div>
                            <input 
                              type="text" 
                              readOnly={workflow.missionStatus === 'published'}
                              value={workflow.nicheName} 
                              onChange={(e) => setField('nicheName', e.target.value)} 
                              placeholder="e.g., AI Writing Tool for Researchers" 
                              className={`w-full px-8 py-5 bg-slate-50 border rounded-[1.2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 font-bold text-xl transition-all ${!workflow.nicheName.trim() ? 'border-rose-100 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.05)]' : 'border-slate-100'}`} 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 ml-4">
                              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Goals *</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => setPreviewMarkdown(!previewMarkdown)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${previewMarkdown ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                >
                                  {previewMarkdown ? <Edit3 className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                  {previewMarkdown ? 'Edit' : 'Preview Annotations'}
                                </button>
                              </div>
                            </div>
                            {previewMarkdown ? (
                              <div className="w-full px-8 py-5 bg-indigo-50/30 border border-indigo-100 rounded-[1.2rem] min-h-[140px] prose prose-sm prose-indigo max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: workflow.description || "<em>No annotations provided yet.</em>" }} />
                              </div>
                            ) : (
                              <RichTextEditor 
                                content={workflow.description}
                                onChange={(html) => setField('description', html)}
                                readOnly={workflow.missionStatus === 'published'}
                                placeholder="What are the mission goals?"
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Product Name *</span>
                              </div>
                              <input 
                                type="text" 
                                readOnly={workflow.missionStatus === 'published'}
                                value={workflow.productName} 
                                onChange={(e) => setField('productName', e.target.value)} 
                                placeholder="e.g., Slack" 
                                className={`w-full px-8 py-5 bg-slate-50 border rounded-[1.2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 font-bold text-xl transition-all ${!workflow.productName.trim() ? 'border-rose-100' : 'border-slate-100'}`} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Feature to Analyze *</span>
                              </div>
                              <input 
                                type="text" 
                                readOnly={workflow.missionStatus === 'published'}
                                value={workflow.featureName} 
                                onChange={(e) => setField('featureName', e.target.value)} 
                                placeholder="e.g., Admin Dashboard" 
                                className={`w-full px-8 py-5 bg-slate-50 border rounded-[1.2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 font-bold text-xl transition-all ${!workflow.featureName.trim() ? 'border-rose-100' : 'border-slate-100'}`} 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 ml-4">
                              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Goals *</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => setPreviewMarkdown(!previewMarkdown)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${previewMarkdown ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                >
                                  {previewMarkdown ? <Edit3 className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                  {previewMarkdown ? 'Edit' : 'Preview Annotations'}
                                </button>
                              </div>
                            </div>
                            {previewMarkdown ? (
                              <div className="w-full px-8 py-5 bg-indigo-50/30 border border-indigo-100 rounded-[1.2rem] min-h-[140px] prose prose-sm prose-indigo max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: workflow.description || "<em>No annotations provided yet.</em>" }} />
                              </div>
                            ) : (
                              <RichTextEditor 
                                content={workflow.description}
                                onChange={(html) => setField('description', html)}
                                readOnly={workflow.missionStatus === 'published'}
                                placeholder="Describe the optimization goals..."
                              />
                            )}
                          </div>
                        </div>
                      )}
                   </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <ProblemListInput 
                      problems={workflow.problemsToSolve} 
                      onChange={(probs) => setField('problemsToSolve', probs)}
                      label="3. Known Friction Points (Optional)"
                      placeholder="Add a specific problem to deep dive..."
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-4">
                      Pro-tip: Adding specific problems forces the Scout into "Surgical Strike" mode for more relevant results.
                    </p>
                 </div>
            </Card>

            {loading && <LoadingOverlay />}

            {!loading && workflow.config && (
              <div className="w-full space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center gap-2 mb-4">
                   <div className="w-px h-12 bg-gradient-to-b from-indigo-200 to-indigo-500" />
                   <div className="px-4 py-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                     Execution Protocol Initiated
                   </div>
                </div>

                {workflow.config.steps.map((step, idx) => {
                  const meta = STRATEGY_METADATA[step.probe as StrategyCategory] || FALLBACK_META;
                  const Icon = meta.icon;
                  
                  return (
                    <div key={idx} className="relative group">
                      <StepInsertionPoint index={idx} />
                      
                      <Card className={`relative overflow-hidden transition-all duration-500 border-none shadow-lg hover:shadow-xl rounded-[2.5rem] bg-white group/card ${workflow.missionStatus === 'published' ? 'opacity-95' : ''}`}>
                        <div className={`absolute top-0 left-0 w-2 h-full ${meta.color}`} />
                        
                        <div className="p-8 md:p-10">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-start gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${meta.color} group-hover/card:scale-110 transition-transform duration-500`}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tight border-slate-200 text-slate-400">Phase {step.index}</Badge>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{step.goal}</h3>
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-xl">{step.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                               {workflow.missionStatus !== 'published' && (
                                 <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => moveStep(idx, 'up')} disabled={idx === 0}>
                                     <ArrowUp className="w-4 h-4" />
                                   </Button>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => moveStep(idx, 'down')} disabled={idx === workflow.config!.steps.length - 1}>
                                     <ArrowDown className="w-4 h-4" />
                                   </Button>
                                   <div className="w-px h-4 bg-slate-200 mx-1" />
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={() => deleteStep(idx)}>
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                               )}
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step.queries?.map((query, qIdx) => {
                              const result = workflow.results[query];
                              return (
                                <div key={qIdx} className="space-y-3">
                                  <div className="flex items-center gap-2 group/query">
                                    <div className="flex-1 px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600 truncate hover:border-indigo-200 transition-all">
                                      {query}
                                    </div>
                                    {!result && (
                                      <Button 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 shrink-0"
                                        onClick={() => runResearch(query)}
                                      >
                                        <Play className="w-5 h-5 fill-current" />
                                      </Button>
                                    )}
                                  </div>
                                  {result && <InsightCard result={result} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
                <StepInsertionPoint index={workflow.config.steps.length} />
                
                <div className="pt-12 flex flex-col items-center gap-6">
                  {!workflow.isExecutingAuto && !workflow.reportContent && (
                    <Button 
                      size="lg" 
                      onClick={executeFullDeepDive}
                      className="rounded-[2rem] h-20 px-12 text-xl font-black bg-slate-900 text-white hover:bg-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                      Initialize Full Deep Dive <Sparkles className="ml-4 w-6 h-6 text-indigo-400 group-hover:animate-spin" />
                    </Button>
                  )}
                  {workflow.isExecutingAuto && (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                      <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">Orchestrating Search Agents...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && workflow.reportContent && (
              <div ref={reportRef} className="w-full mt-24 animate-in zoom-in-95 duration-700">
                <div className="flex items-center justify-center gap-4 mb-8">
                   <div className="h-px flex-1 bg-slate-200" />
                   <Badge variant="outline" className="bg-slate-900 text-white px-6 py-2 rounded-full uppercase font-black tracking-[0.3em] text-[10px]">Strategic Report</Badge>
                   <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Card className="bg-white border-none shadow-2xl rounded-[3rem] overflow-hidden">
                   <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">Market Intel Summary</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generated by Gemini 3.0 Strategic Core</p>
                      </div>
                      <div className="flex gap-3">
                         <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 px-6 font-bold" onClick={copyMarkdown}>
                           <Copy className="w-4 h-4 mr-2" /> Markdown
                         </Button>
                         <Button className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-6 font-bold" onClick={copyForGoogleDocs}>
                           <FileCheck className="w-4 h-4 mr-2" /> Copy for Docs
                         </Button>
                      </div>
                   </div>
                   
                   <div className="p-8 md:p-16 prose prose-indigo max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {workflow.reportContent}
                     </ReactMarkdown>
                   </div>

                   <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Cycle Complete</p>
                      <Button variant="ghost" onClick={() => { setField('reportContent', null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-slate-500 hover:text-indigo-600 font-bold">
                        <RotateCcw className="w-4 h-4 mr-2" /> Re-analyze Data
                      </Button>
                   </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ResearchCanvas;
