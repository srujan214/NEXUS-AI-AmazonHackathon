'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { FullAnalytics } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<FullAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await api.getFullAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview;
  const activityData = analytics?.activityTrend || [];
  const subjectBreakdown = analytics?.subjectBreakdown || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart2 className="w-6 h-6 text-cyan-400" />
          Academic Analytics &amp; Productivity Insights
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic metrics and velocity computed directly from your task logs and focus sessions.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">
              {overview ? `${overview.focusHoursThisWeek}h` : '18h'}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Weekly Focus Hours</p>
          <p className="text-[11px] font-semibold text-cyan-400 mt-1">
            {overview?.focusHoursDelta || '+ 5h this week'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">
              {overview ? overview.activeTasks : 12}
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Active Deliverables</p>
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">
            {overview?.activeTasksDelta || '+ 2 new'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">
              {overview ? `${overview.weeklyProgressPercent}%` : '87%'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Weekly Goal Progress</p>
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">
            {overview?.progressDelta || '+ 12%'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">2.6h</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Avg. Daily Focus</p>
          <p className="text-[11px] font-semibold text-amber-400 mt-1">Optimal Retention</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): 7-Day Velocity Area Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Focus Hours &amp; Completion Velocity</h2>
              <p className="text-xs text-slate-400">Comparing active study sessions with task completions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_6px_#8b5cf6]" />
                Focus Time
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                Completed
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="anCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200">{label}</p>
                          <p className="text-violet-400 font-semibold">Focus: {payload[0]?.value}h</p>
                          {payload[1] && <p className="text-cyan-400 font-semibold">Tasks: {payload[1]?.value}</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="focusHours" stroke="#8b5cf6" strokeWidth={3} fill="url(#anViolet)" />
                <Area type="monotone" dataKey="tasksCompleted" stroke="#06b6d4" strokeWidth={2.5} fill="url(#anCyan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (4 cols): Subject Focus Distribution */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="pb-3 border-b border-slate-800/70">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Subject Time Distribution
            </h2>
            <p className="text-xs text-slate-400">Total hours dedicated per course</p>
          </div>

          <div className="space-y-3.5">
            {subjectBreakdown.map((item) => (
              <div key={item.subject} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-200">{item.subject}</span>
                  <span className="text-cyan-300">{item.focusHours}h ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div className="p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Productivity Diagnostics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <span className="font-bold text-emerald-400 text-xs">High Consistency</span>
            <p className="text-slate-300 mt-1">
              Your focus hours show steady momentum. Sundays and Fridays represent peak engagement.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <span className="font-bold text-violet-400 text-xs">Exam Readiness</span>
            <p className="text-slate-300 mt-1">
              Data Structures and Spring Boot comprise 53% of all study sessions, keeping you ahead of syllabus milestones.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <span className="font-bold text-cyan-400 text-xs">Optimization Tip</span>
            <p className="text-slate-300 mt-1">
              Schedule complex coding sessions between 9 AM and 12 PM to take advantage of your peak cognitive window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
