'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Task, StudySession } from '@/types';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // will be triggered from parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setTasks([]);
      setSessions([]);
      return;
    }

    if (query.trim().length > 1) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const [foundTasks, foundSessions] = await Promise.all([
            api.getTasks({ query }),
            api.getSchedule(),
          ]);
          setTasks(foundTasks);
          setSessions(
            foundSessions.filter((s) =>
              s.title.toLowerCase().includes(query.toLowerCase()) ||
              s.subject.toLowerCase().includes(query.toLowerCase())
            )
          );
        } catch (err) {
          console.error('Search error', err);
        } finally {
          setIsLoading(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setTasks([]);
      setSessions([]);
    }
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0d1424] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-violet-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search tasks, subjects, calendar events, or ask Nexus..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-sm outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="text-center py-8 text-sm text-slate-400">Searching your academic universe...</div>
          )}

          {!isLoading && query && tasks.length === 0 && sessions.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              No tasks or schedule blocks found for &quot;<span className="text-violet-300">{query}</span>&quot;
            </div>
          )}

          {!query && (
            <div className="py-6 px-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/tasks"
                  onClick={onClose}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-sm text-slate-200 border border-slate-700/50"
                >
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>View All Active Tasks</span>
                </Link>
                <Link
                  href="/assistant"
                  onClick={onClose}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-sm text-slate-200 border border-slate-700/50"
                >
                  <ArrowRight className="w-4 h-4 text-violet-400" />
                  <span>Ask AI Assistant</span>
                </Link>
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {tasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Tasks ({tasks.length})
              </p>
              <div className="space-y-1.5">
                {tasks.slice(0, 5).map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 text-sm border border-slate-800 group"
                  >
                    <div>
                      <p className="text-slate-100 font-medium group-hover:text-cyan-300 transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.subject} &bull; Due {task.dueDate.substring(0, 10)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {task.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Sessions Results */}
          {sessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" /> Schedule Sessions ({sessions.length})
              </p>
              <div className="space-y-1.5">
                {sessions.slice(0, 4).map((s) => (
                  <Link
                    key={s.id}
                    href="/planner"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 text-sm border border-slate-800 group"
                  >
                    <div>
                      <p className="text-slate-100 font-medium group-hover:text-violet-300 transition-colors">{s.title}</p>
                      <p className="text-xs text-slate-400">{s.subject} &bull; {s.durationMinutes} mins</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
