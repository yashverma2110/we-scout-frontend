'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  ChevronRight,
  TrendingUp,
  Users,
  Check,
  ShieldAlert,
  LineChart,
  Zap,
  Globe,
  Target,
  Layout,
  MessageSquare
} from 'lucide-react';

const LandingPageClient: React.FC = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push('/canvas');
  };
  // Intersection Observer for Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.scroll-reveal');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-300 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="secondary" className="mb-6 py-2 px-5 text-indigo-700 bg-indigo-50 border-indigo-100 font-black uppercase tracking-widest text-[10px] md:text-[12px] shadow-sm">
              Next-Gen Market Intelligence
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-[950] text-slate-900 tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Scout Markets.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Dominate Niches.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 leading-relaxed max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 font-medium">
            Transform raw product ideas into board-ready strategic reports. We Scout uses AI-powered web-orchestration to find rivals, uncover pain points, and track momentum.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <Button size="lg" className="rounded-2xl h-16 px-10 text-lg shadow-2xl shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.03] active:scale-[0.98] font-black" onClick={handleStart}>
              Launch Scout Mission <Rocket className="ml-3 w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Floating UI Elements Decor */}
        <div className="mt-20 md:mt-32 max-w-5xl mx-auto relative animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-500">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-800 p-2 md:p-4 rotate-x-12 scale-[1.02]">
            <div className="bg-slate-800 rounded-[1.8rem] overflow-hidden border border-slate-700">
               <div className="h-10 bg-slate-900 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex-1 h-5 bg-slate-800 rounded flex items-center px-2 text-[9px] text-slate-500 font-mono">
                    https://marketscout.ai/research/canvas
                  </div>
               </div>
               <div className="h-[400px] md:h-[600px] bg-slate-50 grid grid-cols-12 overflow-hidden">
                  <div className="col-span-3 border-r border-slate-200 p-6 space-y-6 hidden md:block">
                    <div className="space-y-2"><div className="h-2 w-1/2 bg-slate-200 rounded" /><div className="h-8 w-full bg-indigo-100 rounded-xl" /></div>
                    <div className="space-y-4">
                      <div className="h-12 w-full bg-slate-100 rounded-xl" />
                      <div className="h-12 w-full bg-slate-100 rounded-xl" />
                      <div className="h-12 w-full bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-9 p-8 space-y-8">
                     <div className="h-8 w-1/3 bg-slate-200 rounded" />
                     <div className="grid grid-cols-2 gap-6">
                        <div className="h-64 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
                          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white"><Users className="w-5 h-5"/></div>
                          <div className="h-4 w-3/4 bg-slate-100 rounded" />
                          <div className="space-y-2"><div className="h-3 w-full bg-slate-50 rounded" /><div className="h-3 w-4/5 bg-slate-50 rounded" /></div>
                        </div>
                        <div className="h-64 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
                          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white"><ShieldAlert className="w-5 h-5"/></div>
                          <div className="h-4 w-3/4 bg-slate-100 rounded" />
                          <div className="space-y-2"><div className="h-3 w-full bg-slate-50 rounded" /><div className="h-3 w-4/5 bg-slate-50 rounded" /></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          {/* Overlay Badges */}
          <div className="absolute top-10 -left-10 md:-left-20 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 hidden sm:flex items-center gap-3 animate-bounce">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white"><TrendingUp className="w-5 h-5" /></div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Vector</p>
                <p className="text-sm font-bold text-slate-800">+42% Search Momentum</p>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Folds */}
      <div id="features" className="space-y-32 md:space-y-64 py-24 md:py-48">
        
        {/* Fold 1: Direct Rivals */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center overflow-visible">
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-100">
             <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 mb-6 py-1 px-4 uppercase font-bold tracking-widest text-[10px]">Strategic Layer 01</Badge>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">Unmask Your Rivals.</h2>
             <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium mb-10">
               We Scout doesn't just list websites. It performs high-intent orchestrated queries to find direct competitors, hidden alternatives, and niche software you didn't know existed.
             </p>
             <ul className="space-y-4">
                {[
                  "Deep Rival Discovery on Product Hunt & G2",
                  "Alternative Search Logic for Hidden Gems",
                  "Feature Parity Comparison mapping"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                     <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                       <Check className="w-3 h-3 text-white" />
                     </div>
                     {text}
                  </li>
                ))}
             </ul>
          </div>
          <div className="relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-300">
             <div className="absolute inset-0 bg-indigo-600/5 rounded-[3rem] -rotate-6 scale-105" />
             <div className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"><Users className="w-6 h-6" /></div>
                   <span className="text-xl font-black text-slate-900">Competitor Monitor</span>
                </div>
                <div className="space-y-3">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-indigo-100 rounded-full animate-pulse" />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>

        {/* Fold 2: Pain Points */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center overflow-visible">
          <div className="order-2 md:order-1 relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-300">
             <div className="absolute inset-0 bg-rose-600/5 rounded-[3rem] rotate-6 scale-105" />
             <div className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg"><ShieldAlert className="w-6 h-6" /></div>
                   <span className="text-xl font-black text-slate-900">Sentiment Analyzer</span>
                </div>
                <div className="space-y-4">
                   <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-900 text-sm font-bold italic">
                     "Existing tools in this niche have terrible mobile apps. I spend 20 minutes just trying to log in..."
                   </div>
                   <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 text-sm font-medium">
                     "The pricing jump from Starter to Pro is way too steep for my SMB."
                   </div>
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-100">
             <Badge className="bg-rose-50 text-rose-600 border-rose-100 mb-6 py-1 px-4 uppercase font-bold tracking-widest text-[10px]">Strategic Layer 02</Badge>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">Hear the Friction.</h2>
             <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium mb-10">
               We scour Reddit, Hacker News, and Forums to find where the current market solutions fail. Build your product around the gaps your competitors ignored.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                   <div className="text-3xl font-black text-slate-900 mb-1">92%</div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Reliability</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                   <div className="text-3xl font-black text-slate-900 mb-1">Reddit</div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Depth</p>
                </div>
             </div>
          </div>
        </section>

        {/* Fold 3: Trend Analysis */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center overflow-visible">
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-100">
             <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 mb-6 py-1 px-4 uppercase font-bold tracking-widest text-[10px]">Strategic Layer 03</Badge>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">Ride the Momentum.</h2>
             <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium mb-10">
               Don't build in a dying market. Use Google Trends velocity and real-time social buzz to verify that interest in your product is climbing.
             </p>
             <Button variant="outline" className="rounded-xl border-slate-200 font-bold group" onClick={handleStart}>
               Try Trend Scout <LineChart className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
          <div className="relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700 delay-300">
             <div className="bg-emerald-500/10 rounded-[3rem] p-8 md:p-12">
                <div className="h-64 flex items-end gap-3">
                   {[40, 65, 55, 80, 75, 95, 100].map((h, i) => (
                     <div 
                      key={i} 
                      className="bg-emerald-500 w-full rounded-t-xl animate-in slide-in-from-bottom-full duration-1000" 
                      style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }} 
                     />
                   ))}
                </div>
                <div className="mt-8 flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                   <span>Q1 2024</span>
                   <span>Q4 2025</span>
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* Final CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-32 md:py-48 text-center scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
         <div className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] -z-10" />
            
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8">Ready to Scout?</h2>
            <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
              Join founders and strategists using AI to outmaneuver the market. Initialize your first mission today.
            </p>
            <Button size="lg" className="rounded-2xl h-20 px-12 text-xl shadow-2xl shadow-indigo-500/40 bg-indigo-600 hover:bg-indigo-700 font-black" onClick={handleStart}>
              Get Started For Free <Zap className="ml-3 w-6 h-6 fill-current" />
            </Button>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40">
              <div className="flex items-center gap-2 text-white font-bold"><Globe className="w-5 h-5" /> Global Data</div>
              <div className="flex items-center gap-2 text-white font-bold"><ShieldAlert className="w-5 h-5" /> Risk Intel</div>
              <div className="flex items-center gap-2 text-white font-bold"><Target className="w-5 h-5" /> Precision Search</div>
            </div>
         </div>
      </section>

      <footer className="border-t border-slate-100 py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <Zap className="w-8 h-8 text-indigo-600 fill-current" />
               <span className="font-black text-slate-900 uppercase tracking-tighter">We Scout</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">© 2025 Scout Intelligence Lab. Built with Gemini 3.0</p>
            <div className="flex gap-6">
               <button className="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm">Terms</button>
               <button className="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm">Privacy</button>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPageClient;
