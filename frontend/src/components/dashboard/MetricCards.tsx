'use client';

import React from 'react';
import { CheckSquare, Calendar, Clock, Target } from 'lucide-react';
import { AnalyticsOverview } from '@/types';

interface MetricCardsProps {
  overview?: AnalyticsOverview | null;
}

export function MetricCards({ overview }: MetricCardsProps) {
  const cards = [
    {
      title: 'Active Tasks',
      value: overview ? overview.activeTasks.toString() : '12',
      delta: overview?.activeTasksDelta || '↑ 2 new',
      deltaColor: 'text-emerald-400',
      icon: CheckSquare,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Upcoming Deadlines',
      value: overview ? overview.upcomingDeadlines.toString() : '4',
      delta: overview?.deadlinesDelta || '↓ 1 earlier',
      deltaColor: 'text-amber-400',
      icon: Calendar,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Focus Time',
      value: overview ? `${Math.round(overview.focusHoursThisWeek)}h` : '18h',
      delta: overview?.focusHoursDelta || '↑ 5h this week',
      deltaColor: 'text-cyan-400',
      icon: Clock,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Weekly Progress',
      value: overview ? `${overview.weeklyProgressPercent}%` : '87%',
      delta: overview?.progressDelta || '↑ 12%',
      deltaColor: 'text-emerald-400',
      icon: Target,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl p-4 bg-[#0d1424]/90 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-md flex items-center justify-between"
          >
            <div>
              <span className="text-2xl font-extrabold text-white tracking-tight">{card.value}</span>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{card.title}</p>
              <p className={`text-[11px] font-semibold mt-1.5 ${card.deltaColor}`}>
                {card.delta}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.bgColor} border ${card.borderColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
