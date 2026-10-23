'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, Clock, ArrowRightCircle } from 'lucide-react';
import { AiInsight } from '@/types';

interface AiInsightsWidgetProps {
  insights?: AiInsight[];
}

export function AiInsightsWidget({ insights }: AiInsightsWidgetProps) {
  const defaultItems = [
    {
      id: 'progress',
      title: "You're 78% on track",
      description: 'Keep going! Your study plan is working well.',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'time',
      title: 'Most productive time',
      description: 'You focus best between 9 AM \u2013 12 PM.',
      icon: Clock,
      iconColor: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
    },
    {
      id: 'step',
      title: 'Suggested next step',
      description: 'Complete your Java assignment before moving to the next module.',
      icon: ArrowRightCircle,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">AI Insights</h2>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-violet-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Insights List matching mockup */}
      <div className="space-y-3">
        {defaultItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bgColor} border ${item.borderColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{item.title}</p>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
