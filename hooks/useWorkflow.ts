'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkflowState, StrategyCategory, ResearchSource, SearchResult, WorkflowStep, SavedMission, MissionStatus } from '@/types';
import { generateWorkflowPlan, executeResearchQuery, generateMarketReport } from '@/services/geminiService';
import { STRATEGY_METADATA } from '@/constants';

const STORAGE_KEY = 'market_scout_missions';

export const useWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [savedMissions, setSavedMissions] = useState<SavedMission[]>([]);
  const stopSignal = useRef(false);
  const [workflow, setWorkflow] = useState<WorkflowState>({
    activeMissionId: null,
    missionStatus: 'draft',
    objective: 'new_product',
    productName: '',
    featureName: '',
    nicheName: '',
    description: '',
    problemsToSolve: [],
    config: null,
    currentStep: 0,
    activeCategories: ['competitor', 'pain_point', 'review', 'trend'],
    enabledSources: ['google', 'reddit', 'x', 'product_hunt', 'google_trends', 'g2', 'trustpilot'],
    probeSources: {
      competitor: ['google', 'product_hunt'],
      pain_point: ['reddit', 'google'],
      review: ['google', 'g2', 'trustpilot'],
      trend: ['google_trends', 'x'],
      audience: ['reddit'],
      positioning: ['google']
    },
    results: {},
    isExecutingAuto: false,
    overallProgress: 0,
    reportContent: null
  });

  // Load missions from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedMissions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored missions", e);
      }
    }
  }, []);

  const setField = (field: keyof WorkflowState, value: any) => {
    if (workflow.missionStatus === 'published' && !['isExecutingAuto', 'overallProgress', 'results', 'reportContent'].includes(field)) {
      return; // Prevent edits to published missions except for dynamic state
    }
    setWorkflow(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (cat: StrategyCategory) => {
    if (workflow.missionStatus === 'published') return;
    setWorkflow(prev => {
      const active = prev.activeCategories.includes(cat)
        ? prev.activeCategories.filter(c => c !== cat)
        : [...prev.activeCategories, cat];
      return { ...prev, activeCategories: active };
    });
  };

  const toggleSource = (category: StrategyCategory, source: ResearchSource) => {
    if (workflow.missionStatus === 'published') return;
    setWorkflow(prev => {
      // Don't allow toggling a source if it's disabled globally
      if (!prev.enabledSources.includes(source)) return prev;

      const current = prev.probeSources[category];
      const next = current.includes(source) 
        ? current.filter(s => s !== source)
        : [...current, source];
      return {
        ...prev,
        probeSources: { ...prev.probeSources, [category]: next }
      };
    });
  };

  const toggleGlobalSource = (source: ResearchSource) => {
    if (workflow.missionStatus === 'published') return;
    setWorkflow(prev => {
      const isCurrentlyEnabled = prev.enabledSources.includes(source);
      const nextEnabled = isCurrentlyEnabled
        ? prev.enabledSources.filter(s => s !== source)
        : [...prev.enabledSources, source];

      // If we disable a source globally, we must remove it from all specific category probeSources
      const nextProbeSources = { ...prev.probeSources };
      if (isCurrentlyEnabled) {
        Object.keys(nextProbeSources).forEach(cat => {
          const category = cat as StrategyCategory;
          nextProbeSources[category] = nextProbeSources[category].filter(s => s !== source);
        });
      }

      return {
        ...prev,
        enabledSources: nextEnabled,
        probeSources: nextProbeSources
      };
    });
  };

  const handleGenerate = async () => {
    if (!workflow.objective || workflow.missionStatus === 'published') return;
    setLoading(true);
    setWorkflow(prev => ({ ...prev, reportContent: null, results: {}, overallProgress: 0 }));
    try {
      const plan = await generateWorkflowPlan(
        workflow.objective,
        {
          productName: workflow.productName,
          featureName: workflow.featureName,
          nicheName: workflow.nicheName,
          description: workflow.description,
          problemsToSolve: workflow.problemsToSolve
        },
        workflow.activeCategories,
        workflow.probeSources
      );
      setWorkflow(prev => ({ ...prev, config: plan }));
    } catch (err) {
      alert("Workflow generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const saveMission = (status: MissionStatus) => {
    const missionId = workflow.activeMissionId || crypto.randomUUID();
    const versionId = status === 'published' ? `v${Date.now()}` : 'draft';
    
    const newMission: SavedMission = {
      id: missionId,
      versionId: versionId,
      status: status,
      timestamp: Date.now(),
      config: workflow.config,
      results: workflow.results,
      reportContent: workflow.reportContent,
      productDetails: {
        objective: workflow.objective,
        productName: workflow.productName,
        featureName: workflow.featureName,
        nicheName: workflow.nicheName,
        description: workflow.description,
        problemsToSolve: workflow.problemsToSolve,
        activeCategories: workflow.activeCategories,
        probeSources: workflow.probeSources,
        enabledSources: workflow.enabledSources
      }
    };

    setSavedMissions(prev => {
      const filtered = prev.filter(m => m.id !== missionId || m.status === 'published');
      const updated = [newMission, ...filtered];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setWorkflow(prev => ({ 
      ...prev, 
      activeMissionId: missionId, 
      missionStatus: status 
    }));
  };

  const loadMission = (mission: SavedMission) => {
    setWorkflow({
      activeMissionId: mission.id,
      missionStatus: mission.status,
      objective: mission.productDetails.objective,
      productName: mission.productDetails.productName,
      featureName: mission.productDetails.featureName,
      nicheName: mission.productDetails.nicheName,
      description: mission.productDetails.description,
      problemsToSolve: mission.productDetails.problemsToSolve,
      config: mission.config,
      currentStep: 0,
      activeCategories: mission.productDetails.activeCategories,
      enabledSources: mission.productDetails.enabledSources || ['google', 'reddit', 'x', 'product_hunt', 'google_trends', 'g2', 'trustpilot'],
      probeSources: mission.productDetails.probeSources,
      results: mission.results || {},
      isExecutingAuto: false,
      overallProgress: 0,
      reportContent: mission.reportContent
    });
  };

  const createNewMission = () => {
    setWorkflow({
      activeMissionId: null,
      missionStatus: 'draft',
      objective: 'new_product',
      productName: '',
      featureName: '',
      nicheName: '',
      description: '',
      problemsToSolve: [],
      config: null,
      currentStep: 0,
      activeCategories: ['competitor', 'pain_point', 'review', 'trend'],
      enabledSources: ['google', 'reddit', 'x', 'product_hunt', 'google_trends', 'g2', 'trustpilot'],
      probeSources: {
        competitor: ['google', 'product_hunt'],
        pain_point: ['reddit', 'google'],
        review: ['google', 'g2', 'trustpilot'],
        trend: ['google_trends', 'x'],
        audience: ['reddit'],
        positioning: ['google']
      },
      results: {},
      isExecutingAuto: false,
      overallProgress: 0,
      reportContent: null
    });
  };

  const runResearch = async (query: string): Promise<SearchResult> => {
    setWorkflow(prev => ({
      ...prev,
      results: { ...prev.results, [query]: { text: '', links: [], loading: true } }
    }));
    try {
      const result = await executeResearchQuery(query);
      const searchResult = { ...result, loading: false };
      setWorkflow(prev => ({
        ...prev,
        results: { ...prev.results, [query]: searchResult }
      }));
      return searchResult;
    } catch (error) {
      const failedResult = { text: 'Failed to conduct real-time research.', links: [], loading: false };
      setWorkflow(prev => ({ ...prev, results: { ...prev.results, [query]: failedResult } }));
      return failedResult;
    }
  };

  const executeFullDeepDive = async () => {
    if (!workflow.config) return;
    stopSignal.current = false;
    setWorkflow(prev => ({ ...prev, isExecutingAuto: true, overallProgress: 0, reportContent: null }));
    const allQueries: string[] = [];
    workflow.config.steps.forEach(step => {
      if (step.queries) allQueries.push(...step.queries);
    });
    const total = allQueries.length;
    let completed = 0;
    const finalResults: Record<string, SearchResult> = { ...workflow.results };
    
    for (const query of allQueries) {
      // Check before starting a query
      if (stopSignal.current) {
        setWorkflow(prev => ({ ...prev, isExecutingAuto: false }));
        return;
      }

      if (finalResults[query]?.text) {
        completed++;
        continue;
      }
      
      const result = await runResearch(query);
      
      // Check immediately after a query finishes
      if (stopSignal.current) {
        setWorkflow(prev => ({ ...prev, isExecutingAuto: false }));
        return;
      }
      
      finalResults[query] = result;
      completed++;
      setWorkflow(prev => ({ ...prev, overallProgress: Math.round((completed / total) * 100) }));
    }
    
    if (stopSignal.current) {
      setWorkflow(prev => ({ ...prev, isExecutingAuto: false }));
      return;
    }

    try {
      const report = await generateMarketReport(workflow.config, finalResults);
      setWorkflow(prev => {
        const updated = { ...prev, reportContent: report, isExecutingAuto: false, results: finalResults };
        return updated;
      });
    } catch (error) {
      setWorkflow(prev => ({ ...prev, isExecutingAuto: false }));
    }
  };

  const cancelDeepDive = () => {
    stopSignal.current = true;
    // Immediately clear the UI state even if the loop is currently awaiting a promise
    setWorkflow(prev => ({ ...prev, isExecutingAuto: false }));
  };

  const deleteStep = (index: number) => {
    if (workflow.missionStatus === 'published') return;
    setWorkflow(prev => {
      if (!prev.config) return prev;
      const newSteps = prev.config.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, index: i + 1 }));
      return { ...prev, config: { ...prev.config, steps: newSteps } };
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (workflow.missionStatus === 'published') return;
    setWorkflow(prev => {
      if (!prev.config) return prev;
      const newSteps = [...prev.config.steps];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSteps.length) return prev;
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      return {
        ...prev,
        config: { ...prev.config, steps: newSteps.map((s, i) => ({ ...s, index: i + 1 })) }
      };
    });
  };

  const addStepAt = (index: number, category: StrategyCategory) => {
    if (workflow.missionStatus === 'published') return;
    const meta = STRATEGY_METADATA[category];
    const newStep: WorkflowStep = {
      index: index + 1,
      goal: `Deep dive into ${meta.name}`,
      description: `Exploring ${meta.desc} for ${workflow.productName || workflow.nicheName}`,
      probe: category,
      tools: meta.defaultSources,
      queries: [`best ${workflow.productName || workflow.nicheName} ${category}`],
      reasoning: "Manually added phase."
    };
    setWorkflow(prev => {
      if (!prev.config) return prev;
      const newSteps = [...prev.config.steps];
      newSteps.splice(index, 0, newStep);
      return {
        ...prev,
        config: { ...prev.config, steps: newSteps.map((s, i) => ({ ...s, index: i + 1 })) }
      };
    });
  };

  const deleteSavedMission = (id: string) => {
    setSavedMissions(prev => {
      const next = prev.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (workflow.activeMissionId === id) {
      createNewMission();
    }
  };

  return {
    workflow,
    savedMissions,
    loading,
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
  };
};
