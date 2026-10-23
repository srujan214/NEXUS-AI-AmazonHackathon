'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Check,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  BookOpen,
  X,
  CheckSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Task, Priority, TaskStatus } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubject, setFormSubject] = useState('Computer Science');
  const [formPriority, setFormPriority] = useState<Priority>('MEDIUM');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [formEstMins, setFormEstMins] = useState(60);
  const [formError, setFormError] = useState('');

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks({
        status: activeTab,
        priority: selectedPriority,
        subject: selectedSubject,
        query: searchQuery,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeTab, selectedSubject, selectedPriority, searchQuery]);

  const handleToggle = async (taskId: number) => {
    try {
      const updated = await api.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormSubject('Data Structures');
    setFormPriority('MEDIUM');
    setFormDueDate(new Date(Date.now() + 86400000).toISOString().substring(0, 10));
    setFormEstMins(60);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormSubject(task.subject);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate.substring(0, 10));
    setFormEstMins(task.estimatedMinutes || 60);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        const updated = await api.updateTask(editingTask.id, {
          title: formTitle.trim(),
          description: formDesc.trim(),
          subject: formSubject,
          priority: formPriority,
          dueDate: new Date(formDueDate).toISOString(),
          estimatedMinutes: Number(formEstMins),
        });
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      } else {
        const created = await api.createTask({
          title: formTitle.trim(),
          description: formDesc.trim(),
          subject: formSubject,
          priority: formPriority,
          dueDate: new Date(formDueDate).toISOString(),
          estimatedMinutes: Number(formEstMins),
        });
        setTasks((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save task');
    }
  };

  const subjects = ['ALL', 'Java 25', 'Spring Boot', 'Spring AI', 'Data Structures', 'Algorithms', 'UI Development', 'Final Project', 'PostgreSQL', 'Mathematics'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            My Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize academic deadlines, projects, and track daily deliverables.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            {(['ALL', 'PENDING', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Tasks' : tab === 'PENDING' ? 'Active / To Do' : 'Completed'}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            Filters:
          </span>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by Course or Subject"
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 outline-none hover:border-slate-600"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            aria-label="Filter by Priority"
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 outline-none hover:border-slate-600"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <span className="ml-auto text-slate-400 font-medium">
            Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-sm text-slate-400">Loading tasks from PostgreSQL...</div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-16 bg-[#0d1424]/60 border border-slate-800 rounded-2xl p-8">
            <CheckSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No tasks match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding a new assignment.</p>
          </div>
        )}

        {tasks.map((task) => {
          const isDone = task.status === 'COMPLETED';

          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                  : 'bg-[#0d1424]/90 hover:bg-[#11192e] border-slate-800/80 shadow-md'
              }`}
            >
              {/* Left: Checkbox + Title + Description */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                    isDone
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-slate-500 hover:border-violet-400'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm font-bold truncate ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                      <BookOpen className="w-3 h-3 text-violet-400" />
                      {task.subject}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      Due: {task.dueDate.substring(0, 10)}
                    </span>
                    {task.estimatedMinutes && (
                      <span className="flex items-center gap-1 text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {task.estimatedMinutes} mins
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Priority Badge and Action Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    task.priority === 'HIGH'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  onClick={() => openEditModal(task)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e1628] border border-slate-700/80 rounded-3xl p-6 shadow-2xl glass-panel relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                {editingTask ? 'Edit Academic Task' : 'Create New Academic Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Red-Black Tree in Java"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Add details, submission links, or study notes..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject / Course *</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formEstMins}
                    onChange={(e) => setFormEstMins(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
