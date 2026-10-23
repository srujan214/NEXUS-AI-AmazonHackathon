'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, CheckCircle, ArrowRight } from 'lucide-react';
import { McpTool } from '@/types';

interface McpToolsWidgetProps {
  tools?: McpTool[];
}

export function McpToolsWidget({ tools }: McpToolsWidgetProps) {
  const defaultTools = [
    {
      name: 'addTask',
      description: 'Task management',
      status: 'Online',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      sparklinePath: 'M0,15 Q20,5 40,12 T80,3',
      strokeColor: '#8b5cf6',
    },
    {
      name: 'listTasks',
      description: 'View all tasks',
      status: 'Online',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      sparklinePath: 'M0,12 Q20,16 40,4 T80,8',
      strokeColor: '#06b6d4',
    },
    {
      name: 'generateStudyPlan',
      description: 'AI study planning',
      status: 'Online',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      sparklinePath: 'M0,18 Q20,8 40,14 T80,2',
      strokeColor: '#6366f1',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">MCP Tools Connected</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>All healthy</span>
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-2.5">
        {defaultTools.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${t.bgColor} border ${t.borderColor} flex items-center justify-center`}>
                <CheckCircle className={`w-4 h-4 ${t.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-mono">{t.name}</p>
                <p className="text-[11px] text-slate-400">{t.description}</p>
              </div>
            </div>

            {/* Sparkline & Status */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {t.status}
                </span>
              </div>
              {/* Mini SVG Sparkline */}
              <svg className="w-16 h-6 overflow-visible" viewBox="0 0 80 20">
                <path
                  d={t.sparklinePath}
                  fill="none"
                  stroke={t.strokeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom link */}
      <div className="pt-3 mt-3 border-t border-slate-800/70 text-right">
        <Link
          href="/mcp"
          className="text-xs text-violet-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>View MCP Logs & Test Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
