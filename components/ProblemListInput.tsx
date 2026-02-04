'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProblemListInputProps {
  problems: string[];
  onChange: (problems: string[]) => void;
  placeholder?: string;
  label?: string;
}

const ProblemListInput: React.FC<ProblemListInputProps> = ({ 
  problems, 
  onChange, 
  placeholder = "Add a specific friction point...", 
  label = "Known Problems" 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!problems.includes(inputValue.trim())) {
        onChange([...problems, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeProblem = (problemToRemove: string) => {
    onChange(problems.filter(p => p !== problemToRemove));
  };

  const addProblem = () => {
    if (inputValue.trim() && !problems.includes(inputValue.trim())) {
      onChange([...problems, inputValue.trim()]);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 ml-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
          <Badge variant="outline" className="text-[9px] font-normal py-0">Press Enter</Badge>
        </div>
        <div className="relative group">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium text-lg placeholder:text-slate-300"
          />
          <button 
            onClick={addProblem}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {problems.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {problems.map((problem, idx) => (
            <div 
              key={`${problem}-${idx}`}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all animate-in zoom-in-95 duration-200"
            >
              <span className="text-sm font-semibold text-slate-700">{problem}</span>
              <button 
                onClick={() => removeProblem(problem)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemListInput;
