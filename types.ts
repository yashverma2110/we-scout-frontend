
export type StrategyCategory = 'competitor' | 'pain_point' | 'review' | 'trend' | 'audience' | 'positioning';
export type ResearchSource = 'google' | 'reddit' | 'x' | 'product_hunt' | 'google_trends' | 'g2' | 'trustpilot';
export type MissionStatus = 'draft' | 'published';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface SearchResult {
  text: string;
  links: GroundingLink[];
  loading?: boolean;
}

export interface WorkflowStep {
  index: number;
  goal: string;
  description: string;
  probe: StrategyCategory;
  tools: ResearchSource[];
  queries?: string[];
  reasoning?: string;
}

export interface WorkflowConfig {
  productName: string;
  objective: WorkflowObjective;
  steps: WorkflowStep[];
  contextSummary?: string;
}

export type WorkflowObjective = 'new_product' | 'improve_feature';

export interface SavedMission {
  id: string;
  versionId: string;
  status: MissionStatus;
  timestamp: number;
  config: WorkflowConfig | null;
  results: Record<string, SearchResult>;
  reportContent: string | null;
  productDetails: {
    objective: WorkflowObjective | null;
    productName: string;
    featureName: string;
    nicheName: string;
    description: string;
    problemsToSolve: string[];
    activeCategories: StrategyCategory[];
    probeSources: Record<StrategyCategory, ResearchSource[]>;
    enabledSources?: ResearchSource[];
  };
}

export interface WorkflowState {
  activeMissionId: string | null;
  missionStatus: MissionStatus;
  objective: WorkflowObjective | null;
  productName: string;
  featureName: string;
  nicheName: string;
  description: string;
  problemsToSolve: string[];
  config: WorkflowConfig | null;
  currentStep: number;
  probeSources: Record<StrategyCategory, ResearchSource[]>;
  enabledSources: ResearchSource[];
  activeCategories: StrategyCategory[];
  results: Record<string, SearchResult>;
  isExecutingAuto: boolean;
  overallProgress: number;
  reportContent: string | null;
}
