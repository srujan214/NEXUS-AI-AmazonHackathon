'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Send, Bot, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(prompt.trim())}`);
  };

  const handleMic = () => {
    setIsListening(true);
    setTimeout(() => {
      setPrompt('Show my upcoming deadlines');
      setIsListening(false);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1527] via-[#0f172a] to-[#0b1222] border border-slate-800/80 p-7 shadow-2xl glass-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Headline, subtext, and prompt input */}
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold shadow-[0_0_12px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Alexa+ MCP Demo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your academic universe,<br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              organized.
            </span>
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Ask questions, manage tasks, plan your studies and get AI-powered insights &mdash; all in one place.
          </p>

          {/* Quick Ask Nexus Input Bar matching mockup */}
          <form onSubmit={handleSend} className="relative max-w-xl pt-2">
            <div className="flex items-center rounded-2xl bg-slate-900/80 border border-slate-700/80 px-4 py-3 shadow-lg focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all">
              <Sparkles className="w-4 h-4 text-violet-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={isListening ? 'Listening...' : 'Ask Nexus anything...'}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-medium"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleMic}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors ${
                    isListening ? 'text-cyan-400 animate-bounce' : ''
                  }`}
                  title="Voice command"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-40 transition-all hover:scale-105"
                  title="Send to Assistant"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Holographic Glowing Orb & Feature Pills */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
          {/* Animated 3D Holographic Orb matching reference screenshot */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            {/* Outer pulsating rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
            <div className="absolute -inset-3 rounded-full border border-violet-500/30 blur-sm animate-pulse" />
            
            {/* Holographic glowing orb body */}
            <div className="w-36 h-36 rounded-full glow-orb flex items-center justify-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/60 via-indigo-600/40 to-cyan-400/80 mix-blend-overlay" />
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-md" />
              <span className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] tracking-tighter select-none z-10 italic">
                N
              </span>
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-3 text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-violet-500/20 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-medium">Smart Study Planning</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-cyan-500/20 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">Task Automation</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-indigo-500/20 text-slate-300">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">Multi-Model AI</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-emerald-500/20 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Real-time Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
