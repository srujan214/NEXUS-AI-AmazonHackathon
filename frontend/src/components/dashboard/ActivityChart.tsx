'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ActivityPoint } from '@/types';

interface ActivityChartProps {
  data?: ActivityPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data && data.length > 0
    ? data
    : [
        { dayLabel: 'Mon', focusHours: 5.0, tasksCompleted: 2 },
        { dayLabel: 'Tue', focusHours: 8.5, tasksCompleted: 4 },
        { dayLabel: 'Wed', focusHours: 6.0, tasksCompleted: 3 },
        { dayLabel: 'Thu', focusHours: 7.5, tasksCompleted: 4 },
        { dayLabel: 'Fri', focusHours: 9.0, tasksCompleted: 3 },
        { dayLabel: 'Sat', focusHours: 11.0, tasksCompleted: 5 },
        { dayLabel: 'Sun', focusHours: 12.0, tasksCompleted: 4 },
      ];

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md flex flex-col justify-between">
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Your Activity</h2>
          <p className="text-xs text-slate-400">Focus time and task completion over the last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_6px_#8b5cf6]" />
            <span className="text-slate-300 text-[11px]">Focus Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span className="text-slate-300 text-[11px]">Tasks Completed</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-52 w-full relative">
        {/* Mockup Callout Badge for Sunday peak */}
        <div className="absolute right-4 top-2 z-10 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[10px] text-cyan-300 font-semibold shadow-md">
          <span>Sun &bull; 12h focus</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="dayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-200">{label}</p>
                      <p className="text-violet-400 font-semibold">
                        Focus: {payload[0]?.value} hours
                      </p>
                      {payload[1] && (
                        <p className="text-cyan-400 font-semibold">
                          Tasks: {payload[1]?.value} completed
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="focusHours"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#violetGradient)"
            />
            <Area
              type="monotone"
              dataKey="tasksCompleted"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#cyanGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
