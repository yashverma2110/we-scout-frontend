
import { 
  Users, 
  ShieldAlert, 
  Star, 
  TrendingUp, 
  Layout,
  Search,
  MessageSquareText,
  Twitter,
  Package,
  LineChart,
  Award,
  ShieldCheck
} from 'lucide-react';
import { StrategyCategory, ResearchSource } from './types';

export const SOURCE_ICONS: Record<ResearchSource, { icon: any; color: string; label: string; description: string }> = {
  google: { icon: Search, color: 'text-blue-500', label: 'Google Search', description: 'Broad market data & official sites' },
  reddit: { icon: MessageSquareText, color: 'text-orange-500', label: 'Reddit', description: 'Unfiltered user pain points & feedback' },
  x: { icon: Twitter, color: 'text-slate-900', label: 'X / Twitter', description: 'Real-time buzz & influencer trends' },
  product_hunt: { icon: Package, color: 'text-rose-500', label: 'Product Hunt', description: 'Startup launches & early competitors' },
  google_trends: { icon: LineChart, color: 'text-indigo-500', label: 'Google Trends', description: 'Search volume velocity & momentum' },
  g2: { icon: Award, color: 'text-rose-600', label: 'G2', description: 'B2B software reviews and ratings' },
  trustpilot: { icon: ShieldCheck, color: 'text-emerald-500', label: 'Trustpilot', description: 'Consumer service reviews & sentiment' }
};

export const STRATEGY_METADATA: Record<StrategyCategory, { name: string; icon: any; color: string; desc: string; defaultSources: ResearchSource[] }> = {
  competitor: { 
    name: 'Market Rivals', 
    icon: Users, 
    color: 'bg-indigo-500', 
    desc: 'Unmask direct competitors, hidden alternatives, and legacy software currently dominating the space.',
    defaultSources: ['google', 'product_hunt']
  },
  pain_point: { 
    name: 'Friction Analysis', 
    icon: ShieldAlert, 
    color: 'bg-rose-500', 
    desc: 'Scour Reddit and community forums to pinpoint exactly where current solutions are frustrating users.',
    defaultSources: ['reddit', 'google']
  },
  review: { 
    name: 'Sentiment Intel', 
    icon: Star, 
    color: 'bg-amber-400', 
    desc: 'Analyze G2, Capterra, and Trustpilot reviews to extract high-intent feature requests and deal-breakers.',
    defaultSources: ['google', 'g2', 'trustpilot']
  },
  trend: { 
    name: 'Momentum Check', 
    icon: TrendingUp, 
    color: 'bg-emerald-500', 
    desc: 'Track search velocity and real-time social buzz to verify the market interest is actually growing.',
    defaultSources: ['google_trends', 'x']
  },
  audience: {
    name: 'Ideal Persona',
    icon: Users,
    color: 'bg-blue-500', 
    desc: 'Map out the demographics and behavioral triggers of customers most likely to switch to your solution.',
    defaultSources: ['reddit', 'x']
  },
  positioning: {
    name: 'Strategic Gaps',
    icon: Layout,
    color: 'bg-purple-500', 
    desc: 'Identify specific market voids where a new entrant can offer a unique, superior value proposition.',
    defaultSources: ['google']
  }
};
