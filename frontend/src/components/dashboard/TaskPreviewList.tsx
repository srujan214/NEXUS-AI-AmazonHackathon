'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, MoreVertical, Trash2 } from 'lucide-react';
import { Task, Priority } from '@/types';
import { api } from '@/lib/api';

interface TaskPreviewListProps {
  initialTasks: Task[];
  onTasksChanged?: () => void;
}

export function TaskPreviewList({ initialTasks, onTasksChanged }: TaskPreviewListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggle = async (taskId: number) => {
    try {
      setTogglingId(taskId);
      const updated = await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      if (onTasksChanged) onTasksChanged();
    } catch (err) {
      console.error('Failed to toggle task', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (onTasksChanged) onTasksChanged();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const formatDue = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Medium</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Low</span>;
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const displayTasks = (activeTasks.length > 0 ? activeTasks : tasks).slice(0, 6);

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-3">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">My Tasks</h2>
          <p className="text-xs text-slate-400">{activeTasks.length} active tasks</p>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-violet-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Task Rows */}
      <div className="space-y-2">
        {displayTasks.map((task) => {
          const isDone = task.status === 'COMPLETED';
          const isToggling = togglingId === task.id;

          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-900/30 border-slate-800/40 opacity-60'
                  : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-700/40'
              }`}
            >
              {/* Checkbox and Title */}
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  disabled={isToggling}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-slate-500 hover:border-violet-400'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={`text-xs font-medium truncate ${
                    isDone ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                  title={task.title}
                >
                  {task.title}
                </span>
              </div>

              {/* Priority, Due Date and Menu */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {getPriorityBadge(task.priority)}
                <span className="text-[11px] text-slate-400 font-medium min-w-[50px] text-right">
                  {formatDue(task.dueDate)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
