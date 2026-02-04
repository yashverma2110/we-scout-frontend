
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowConfig, WorkflowObjective, StrategyCategory, ResearchSource, GroundingLink, SearchResult } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
const PLAN_MODEL = 'gemini-3-pro-preview';
const SEARCH_MODEL = 'gemini-3-flash-preview';

const CATEGORY_PROMPT_MAP: Record<StrategyCategory, string> = {
  competitor: `"Market_Rivals_Queries": Find direct rivals and alternatives. If specific problems are provided, focus on rivals who claim to solve those problems or fail at them.`,
  pain_point: `"Friction_Analysis_Queries": Target raw feedback on Reddit/Forums. Focus heavily on keywords related to the provided "Known Problems" if they exist.`,
  review: `"Sentiment_Intel_Queries": Extract feature requests and deal-breakers from review sites (G2, Trustpilot). Look for mentions of the specific friction points provided.`,
  trend: `"Momentum_Check_Queries": Check for rising interest. If problems are provided, check if these issues are becoming more frequently discussed.`,
  audience: `"Ideal_Persona_Queries": Identify who suffers most from the provided "Known Problems" to define the target demographic.`,
  positioning: `"Strategic_Gaps_Queries": Identify market voids where the "Known Problems" are currently ignored by the status quo.`
};

export const parseVoiceTranscript = async (transcript: string): Promise<{
  productName?: string;
  nicheName?: string;
  description?: string;
  problemsToSolve?: string[];
  objective?: WorkflowObjective;
}> => {
  const response = await ai.models.generateContent({
    model: SEARCH_MODEL,
    contents: `Extract product research details from this transcript: "${transcript}".
    Identify if it's a new product idea or a feature optimization for an existing one. 
    Return a structured JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          nicheName: { type: Type.STRING },
          description: { type: Type.STRING },
          problemsToSolve: { type: Type.ARRAY, items: { type: Type.STRING } },
          objective: { type: Type.STRING, enum: ['new_product', 'improve_feature'] }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || '{}');
  } catch (e) {
    console.error("Failed to parse voice extraction", e);
    return {};
  }
};

export const generateWorkflowPlan = async (
  objective: WorkflowObjective,
  details: {
    productName?: string;
    featureName?: string;
    nicheName?: string;
    description?: string;
    problemsToSolve?: string[];
  },
  activeCategories: StrategyCategory[],
  probeSources: Record<StrategyCategory, ResearchSource[]>
): Promise<WorkflowConfig> => {
  const idea = details.productName || details.nicheName || "this product";
  const context = details.description || "";
  const hasProblems = details.problemsToSolve && details.problemsToSolve.length > 0;
  const problems = hasProblems 
    ? `KNOWN PROBLEMS TO ADDRESS (MISSION CORE):\n- ${details.problemsToSolve!.join('\n- ')}` 
    : "";
  
  const activeRequirements = activeCategories
    .map((cat, idx) => `${idx + 1}. ${CATEGORY_PROMPT_MAP[cat]}`)
    .join('\n');

  const systemInstruction = `You are a World-Class Market Research Strategist. 
Your goal is to generate distinct, high-intent lists of search queries for: "${idea}".
Context: ${context}

${problems}

RESEARCH STRATEGY (CRITICAL):
${hasProblems 
  ? `PROBLEM-CENTRIC RESEARCH MODE: The mission's primary objective is to investigate the "KNOWN PROBLEMS" listed above. 
Do NOT perform a generic, broad market overview. Instead, dedicate 80-90% of your search queries across ALL phases to validating these specific friction points, finding competitors who specifically struggle with or solve these exact issues, and identifying user sentiment around these specific topics. 
The research should be a "surgical strike" on these problems.` 
  : `EXPLORATORY RESEARCH MODE: No specific problems were provided. Perform a broad, comprehensive scan of the market, trends, and competitors to find general opportunities and existing patterns.`}

ONLY generate workflow steps for the following ACTIVE categories:
${activeRequirements}

Each query you generate must be optimized for the specific tools selected for that phase.

OUTPUT FORMAT:
Ensure the output is a valid WorkflowConfig JSON.`;

  const response = await ai.models.generateContent({
    model: PLAN_MODEL,
    contents: systemInstruction,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          objective: { type: Type.STRING },
          contextSummary: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                goal: { type: Type.STRING },
                description: { type: Type.STRING },
                probe: { 
                  type: Type.STRING, 
                  enum: ['competitor', 'pain_point', 'review', 'trend', 'audience', 'positioning'] 
                },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                queries: { type: Type.ARRAY, items: { type: Type.STRING } },
                reasoning: { type: Type.STRING }
              },
              required: ["index", "goal", "description", "probe", "tools", "queries"]
            }
          }
        },
        required: ["productName", "objective", "steps"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || '{}';
    const config = JSON.parse(jsonStr) as WorkflowConfig;
    config.steps = config.steps.map(step => ({
      ...step,
      tools: probeSources[step.probe as StrategyCategory] || ['google']
    }));
    return config;
  } catch (error) {
    throw new Error("Failed to orchestrate research workflow");
  }
};

export const executeResearchQuery = async (query: string): Promise<{ text: string, links: GroundingLink[] }> => {
  const response = await ai.models.generateContent({
    model: SEARCH_MODEL,
    contents: `Analyze the market results for this query: "${query}". Provide a concise, professional summary of findings including key competitors, user sentiment, or trends found.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No insights found.";
  const links: GroundingLink[] = [];

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        if (!links.find(l => l.uri === chunk.web.uri)) {
          links.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      }
    });
  }

  return { text, links };
};

export const generateMarketReport = async (
  config: WorkflowConfig,
  results: Record<string, SearchResult>
): Promise<string> => {
  const formattedResults = Object.entries(results)
    .map(([query, data]) => `### Query: ${query}\n**Findings:** ${data.text}`)
    .join('\n\n');

  const systemInstruction = `You are a Senior Strategic Market Analyst. 
Generate a professional "Strategic Market Entry Report" for "${config.productName || 'This Project'}" in Markdown.

The report should synthesize the findings from the research steps. 
If specific "Known Problems" were the focus of the mission, the report MUST prioritize conclusions about those problems, suggesting strategic pivots or feature priorities based on the scouted intel.

RESEARCH DATA:
${formattedResults}`;

  const response = await ai.models.generateContent({
    model: PLAN_MODEL,
    contents: systemInstruction,
  });

  return response.text || "Failed to generate report.";
};
