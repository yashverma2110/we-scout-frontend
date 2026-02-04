'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Cpu } from 'lucide-react';
import { SearchResult } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface InsightCardProps {
  result: SearchResult;
}

const InsightCard: React.FC<InsightCardProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (result.loading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 space-y-4 shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[9px] uppercase tracking-widest font-bold">Insight Output</Badge>
          <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-slate-800" />
          <Skeleton className="h-3 w-4/5 bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 border border-slate-800 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 px-6 hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[9px] uppercase tracking-widest font-bold">Insight Output</Badge>
          {!isExpanded && (
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
              {result.text.substring(0, 40)}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-indigo-400 prose-ul:text-slate-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.text}
            </ReactMarkdown>
          </div>
          
          {result.links.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap gap-2">
              {result.links.slice(0, 3).map((link, lIdx) => (
                <a 
                  key={lIdx} 
                  href={link.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all text-indigo-400 group/link"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-bold truncate max-w-[120px]">{link.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightCard;
