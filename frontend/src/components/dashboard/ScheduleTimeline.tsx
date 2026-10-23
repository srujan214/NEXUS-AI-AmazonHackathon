'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { StudySession } from '@/types';
import Link from 'next/link';

interface ScheduleTimelineProps {
  sessions: StudySession[];
}

export function ScheduleTimeline({ sessions }: ScheduleTimelineProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Group or organize blocks across 7 days
  const days = [
    { label: 'Thu 16', key: 'thu' },
    { label: 'Fri 17', key: 'fri' },
    { label: 'Sat 18', key: 'sat' },
    { label: 'Sun 19', key: 'sun' },
    { label: 'Mon 20', key: 'mon' },
    { label: 'Tue 21', key: 'tue' },
    { label: 'Wed 22', key: 'wed' },
  ];

  // Helper color map matching the reference screenshot
  const getBlockStyle = (subject: string, title: string) => {
    const s = (subject + ' ' + title).toLowerCase();
    if (s.includes('data structure') || s.includes('exam')) {
      return 'bg-blue-600/25 border-blue-500/40 text-blue-300 hover:border-blue-400';
    }
    if (s.includes('spring boot') || s.includes('final project') || s.includes('mcp')) {
      return 'bg-violet-600/25 border-violet-500/40 text-violet-300 hover:border-violet-400';
    }
    if (s.includes('test') || s.includes('presentation') || s.includes('math')) {
      return 'bg-amber-600/25 border-amber-500/40 text-amber-300 hover:border-amber-400';
    }
    if (s.includes('ui') || s.includes('algorithms')) {
      return 'bg-cyan-600/25 border-cyan-500/40 text-cyan-300 hover:border-cyan-400';
    }
    return 'bg-emerald-600/25 border-emerald-500/40 text-emerald-300 hover:border-emerald-400';
  };

  // Provide realistic slots if database sessions are distributed
  const blocksPerDay: Record<number, Array<{ time: string; title: string; subject: string }>> = {
    0: [
      { time: '9:00 AM', title: 'Data Structures', subject: 'Data Structures' },
      { time: '2:00 PM', title: 'Project Meeting', subject: 'Final Project' },
      { time: '7:00 PM', title: 'Study Session', subject: 'Algorithms' },
    ],
    1: [
      { time: '10:00 AM', title: 'Spring Boot', subject: 'Spring Boot' },
      { time: '1:00 PM', title: 'Lunch Break', subject: 'Wellness' },
      { time: '4:00 PM', title: 'MCP Development', subject: 'Spring AI' },
    ],
    2: [
      { time: '9:00 AM', title: 'Algorithms', subject: 'Algorithms' },
      { time: '11:00 AM', title: 'Mock Test', subject: 'Data Structures' },
      { time: '3:00 PM', title: 'Reading', subject: 'CS' },
    ],
    3: [
      { time: '10:00 AM', title: 'UI Development', subject: 'UI Development' },
      { time: '2:00 PM', title: 'Review & Practice', subject: 'Java 25' },
      { time: '6:00 PM', title: 'Free Time', subject: 'Personal' },
    ],
    4: [
      { time: '9:00 AM', title: 'Final Project', subject: 'Final Project' },
      { time: '1:00 PM', title: 'Documentation', subject: 'Spring Boot' },
      { time: '5:00 PM', title: 'Exercise', subject: 'Wellness' },
    ],
    5: [
      { time: '10:00 AM', title: 'Presentation Prep', subject: 'Final Project' },
      { time: '3:00 PM', title: 'Group Study', subject: 'Algorithms' },
      { time: '7:00 PM', title: 'Relax', subject: 'Personal' },
    ],
    6: [
      { time: '9:00 AM', title: 'Exam Practice', subject: 'Data Structures' },
      { time: '1:00 PM', title: 'Feedback Review', subject: 'Final Project' },
      { time: '6:00 PM', title: 'Weekly Plan', subject: 'Personal' },
    ],
  };

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md">
      {/* Header and Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">7-Day Schedule</h2>
          <span className="text-xs text-slate-400 ml-2">Oct 16 &ndash; Oct 22, 2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            href="/planner"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold ml-2"
          >
            Open Planner &rarr;
          </Link>
        </div>
      </div>

      {/* 7 Columns Timeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {days.map((day, idx) => {
          const blocks = blocksPerDay[idx] || [];

          return (
            <div key={day.label} className="flex flex-col space-y-2">
              <div className="text-xs font-bold text-slate-300 pb-1 border-b border-slate-800/50">
                {day.label}
              </div>

              <div className="space-y-1.5 flex-1">
                {blocks.map((block, bIdx) => {
                  const styleClass = getBlockStyle(block.subject, block.title);

                  return (
                    <div
                      key={bIdx}
                      className={`p-2 rounded-xl border text-[11px] transition-all cursor-pointer shadow-sm ${styleClass}`}
                    >
                      <div className="flex items-center gap-1 opacity-75 text-[10px] mb-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{block.time}</span>
                      </div>
                      <p className="font-semibold truncate">{block.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
