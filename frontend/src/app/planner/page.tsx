'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Clock,
  BookOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { StudySession } from '@/types';

export default function PlannerPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Manual Form
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Data Structures');
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualTime, setManualTime] = useState('10:00');
  const [manualDuration, setManualDuration] = useState(90);

  // AI Plan Generator Form
  const [aiSubject, setAiSubject] = useState('Spring Boot');
  const [aiExamDate, setAiExamDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10)
  );
  const [aiDailyHours, setAiDailyHours] = useState(2.0);
  const [aiTopics, setAiTopics] = useState(
    'Dependency Injection, Spring MVC & REST, Spring Data JPA, Spring AI & MCP Server'
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResultNotice, setAiResultNotice] = useState('');

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSchedule();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load schedule', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (id: number) => {
    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleCreateManualSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    try {
      const startIso = new Date(`${manualDate}T${manualTime}:00Z`).toISOString();
      const endIso = new Date(new Date(startIso).getTime() + manualDuration * 60000).toISOString();

      const created = await api.createSession({
        title: manualTitle.trim(),
        subject: manualSubject,
        startTime: startIso,
        endTime: endIso,
        durationMinutes: manualDuration,
      });

      setSessions((prev) => [...prev, created]);
      setIsManualModalOpen(false);
      setManualTitle('');
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);
    setAiResultNotice('');

    try {
      const topicsList = aiTopics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Execute generateStudyPlan tool via MCP API
      const result = await api.executeMcpTool('generateStudyPlan', {
        subject: aiSubject,
        examDate: aiExamDate,
        dailyHoursAvailable: Number(aiDailyHours),
        topics: topicsList,
      });

      setAiResultNotice(
        `Generated ${result.result?.totalSessionsCreated || 'sessions'} automated study blocks for ${aiSubject}!`
      );
      await loadSessions();
      setTimeout(() => {
        setIsAiModalOpen(false);
        setAiResultNotice('');
      }, 1800);
    } catch (err: any) {
      setAiResultNotice(`Error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const daysOfWeek = ['Thu 16', 'Fri 17', 'Sat 18', 'Sun 19', 'Mon 20', 'Tue 21', 'Wed 22'];

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('spring') || s.includes('final')) return 'border-violet-500/40 bg-violet-600/20 text-violet-300';
    if (s.includes('data structure') || s.includes('exam')) return 'border-cyan-500/40 bg-cyan-600/20 text-cyan-300';
    if (s.includes('algorithm') || s.includes('prep')) return 'border-amber-500/40 bg-amber-600/20 text-amber-300';
    return 'border-emerald-500/40 bg-emerald-600/20 text-emerald-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-violet-400" />
            Study Planner &amp; Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual 7-day academic timetable with AI-assisted syllabus milestone scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Plan Generator</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Block</span>
          </button>
        </div>
      </div>

      {/* Week Navigation Card */}
      <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white tracking-wide">
            October 16 &ndash; October 22, 2026
          </span>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Spring Boot / Systems
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Data Structures / Practice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Algorithms / Exams
          </span>
        </div>
      </div>

      {/* 7 Days Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map((dayLabel, idx) => {
          return (
            <div
              key={dayLabel}
              className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-3.5 flex flex-col min-h-[460px] shadow-md"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                <span className="text-xs font-extrabold text-white">{dayLabel}</span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  {idx === 0 ? '3 blocks' : idx === 1 ? '3 blocks' : 'Active'}
                </span>
              </div>

              {/* Day Sessions */}
              <div className="space-y-2.5 flex-1">
                {sessions
                  .filter((_, sIdx) => sIdx % 7 === idx)
                  .map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-xl border text-xs shadow-sm transition-all relative group ${getSubjectColor(
                        session.subject
                      )}`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          {session.durationMinutes}m
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="font-bold text-slate-100 truncate">{session.title}</p>
                      <p className="text-[11px] opacity-75 mt-0.5 truncate">{session.subject}</p>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Study Plan Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e1628] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl glass-panel relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Study Plan Generator (MCP Tool)
              </h2>
              <button onClick={() => setIsAiModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiResultNotice && (
              <div className="p-3 mb-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                {aiResultNotice}
              </div>
            )}

            <form onSubmit={handleGenerateAiPlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject / Course</label>
                <input
                  type="text"
                  required
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam / Target Date</label>
                  <input
                    type="date"
                    required
                    value={aiExamDate}
                    onChange={(e) => setAiExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Daily Commitment (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="8"
                    value={aiDailyHours}
                    onChange={(e) => setAiDailyHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Syllabus Topics (comma separated)</label>
                <textarea
                  rows={3}
                  value={aiTopics}
                  onChange={(e) => setAiTopics(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg disabled:opacity-40"
                >
                  {isGeneratingAi ? 'Invoking generateStudyPlan...' : 'Generate & Schedule Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Study Block Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e1628] border border-violet-500/40 rounded-3xl p-6 shadow-2xl glass-panel relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                Add Study Block
              </h2>
              <button onClick={() => setIsManualModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithms Mock Test Review"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (min)</label>
                  <input
                    type="number"
                    step="15"
                    min="15"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
