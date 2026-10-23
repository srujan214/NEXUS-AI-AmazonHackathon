'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Play,
  XCircle,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { api, Mission } from '@/lib/api';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [goalInput, setGoalInput] = useState(
    'I have a Java exam on Friday, a database assignment on Thursday, and only two hours available each evening. Help me prepare.'
  );
  const [dailyHours, setDailyHours] = useState(2.0);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10)
  );

  const [isPlanning, setIsPlanning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadMissions = async () => {
    try {
      const data = await api.getMissions();
      setMissions(data);
      if (data.length > 0 && !currentMission) {
        setCurrentMission(data[0]);
      }
    } catch (err) {
      console.error('Failed to load missions', err);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const handleStartMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isPlanning) return;

    setIsPlanning(true);
    setStatusMessage('Autonomous Orchestration: Analyzing requirements & detecting conflicts...');

    try {
      const mission = await api.planMission(
        goalInput.trim(),
        Number(dailyHours),
        new Date(targetDate).toISOString()
      );
      setCurrentMission(mission);
      setMissions((prev) => [mission, ...prev.filter((m) => m.id !== mission.id)]);
      setStatusMessage('Plan generated successfully. Awaiting student approval.');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApprove = async () => {
    if (!currentMission || isApproving) return;

    setIsApproving(true);
    setStatusMessage('Executing approved plan via real MCP tools (create_task, create_study_session)...');

    try {
      const executed = await api.approveMission(currentMission.id);
      setCurrentMission(executed);
      setMissions((prev) => prev.map((m) => (m.id === executed.id ? executed : m)));
      setStatusMessage('Mission executed successfully! Changes persisted to database.');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancel = async () => {
    if (!currentMission || isCancelling) return;

    setIsCancelling(true);
    try {
      const cancelled = await api.cancelMission(currentMission.id);
      setCurrentMission(cancelled);
      setMissions((prev) => prev.map((m) => (m.id === cancelled.id ? cancelled : m)));
      setStatusMessage('Mission cancelled. No changes applied to database.');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // State Machine Step Indicators
  const stateSteps = [
    { key: 'UNDERSTANDING', label: '1. Understanding', desc: 'Intent & Deadlines' },
    { key: 'PLANNING', label: '2. Planning', desc: 'Scan Database Tasks' },
    { key: 'CHECKING_CONFLICTS', label: '3. Conflict Check', desc: 'Slot Optimization' },
    { key: 'AWAITING_APPROVAL', label: '4. Human Approval', desc: 'Safety Gate' },
    { key: 'EXECUTING', label: '5. MCP Execution', desc: 'Real Tool Calls' },
    { key: 'COMPLETED', label: '6. Completed', desc: 'Database Persisted' },
  ];

  const getStepStatus = (stepKey: string, currentStatus?: string) => {
    if (!currentStatus) return 'upcoming';
    const order = ['UNDERSTANDING', 'PLANNING', 'CHECKING_CONFLICTS', 'AWAITING_APPROVAL', 'EXECUTING', 'COMPLETED'];
    const currIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currentStatus === 'CANCELLED') return 'cancelled';
    if (currentStatus === 'FAILED') return 'failed';
    if (stepIdx < currIdx) return 'completed';
    if (stepIdx === currIdx) return 'active';
    return 'upcoming';
  };

  let proposedPlan: any = null;
  if (currentMission?.proposedPlanJson) {
    try {
      proposedPlan = JSON.parse(currentMission.proposedPlanJson);
    } catch (e) {
      console.error('Failed to parse proposed plan JSON', e);
    }
  }

  let executionSummary: any = null;
  if (currentMission?.executionSummaryJson) {
    try {
      executionSummary = JSON.parse(currentMission.executionSummaryJson);
    } catch (e) {
      console.error('Failed to parse execution summary JSON', e);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Flagship Feature &bull; Alexa+ Hackathon</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-cyan-400" />
            Mission Control
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous AI student operating workflow: transforms natural language study goals into structured,
            conflict-free plans with safety approval gates and genuine MCP tool execution.
          </p>
        </div>
      </div>

      {/* Goal Submission Console */}
      <div className="p-6 rounded-3xl bg-[#0d1424]/90 border border-slate-800/80 shadow-2xl glass-card space-y-4">
        <form onSubmit={handleStartMission} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              State Your High-Level Study Objective / Academic Problem
            </label>
            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. I have a Java exam on Friday, a database assignment on Thursday, and only two hours available each evening. Help me prepare."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Daily Focus Commitment (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-violet-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                Target Exam / Deadline Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-violet-500 font-semibold"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPlanning || !goalInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isPlanning ? 'Orchestrating Workflow...' : 'Initiate Autonomous Planning'}</span>
              </button>
            </div>
          </div>
        </form>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            {statusMessage}
          </div>
        )}
      </div>

      {/* State Machine Execution Timeline Visualization */}
      {currentMission && (
        <div className="p-6 rounded-3xl bg-[#0d1424]/90 border border-slate-800/80 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Mission #{currentMission.id}: Workflow State Machine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Goal: &quot;<span className="text-slate-200">{currentMission.goal}</span>&quot;
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                currentMission.status === 'COMPLETED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : currentMission.status === 'AWAITING_APPROVAL'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                  : currentMission.status === 'CANCELLED'
                  ? 'bg-slate-700/30 text-slate-400 border-slate-700'
                  : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              }`}
            >
              {currentMission.status}
            </span>
          </div>

          {/* Node-based Visual State Flow */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {stateSteps.map((s) => {
              const st = getStepStatus(s.key, currentMission.status);
              return (
                <div
                  key={s.key}
                  className={`p-3.5 rounded-2xl border text-xs transition-all relative ${
                    st === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : st === 'active'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : st === 'failed' || st === 'cancelled'
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{s.label}</span>
                    {st === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {st === 'active' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                  </div>
                  <p className="text-[11px] opacity-75">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Conflict Detection Banner */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              currentMission.conflictsDetected > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {currentMission.conflictsDetected > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-slate-100">
                {currentMission.conflictsDetected > 0
                  ? `Scheduling Conflicts Resolved: ${currentMission.conflictsDetected} Overlap(s) Handled`
                  : 'Conflict Inspection Complete: Clear Study Slots Available'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">{currentMission.conflictDetails}</p>
            </div>
          </div>

          {/* Proposed Plan Review Card */}
          {proposedPlan && (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    Proposed Plan Preview &bull; {proposedPlan.subject}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review generated time blocks before granting execution approval.
                  </p>
                </div>
                <span className="text-xs font-semibold text-cyan-400">
                  {proposedPlan.proposedSessions?.length || 0} Study Blocks &bull;{' '}
                  {proposedPlan.proposedTasks?.length || 0} Deliverable
                </span>
              </div>

              {/* Sessions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {proposedPlan.proposedSessions?.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Day {s.dayIndex}</span>
                      <span className="text-cyan-400 font-semibold">{s.durationMinutes} mins</span>
                    </div>
                    <p className="font-bold text-slate-100">{s.title}</p>
                    <p className="text-[11px] text-slate-400">
                      Time: {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &ndash;{' '}
                      {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Human Approval Gate Buttons */}
              {currentMission.status === 'AWAITING_APPROVAL' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-violet-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                  <div>
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Human Approval Gate
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      NEXUS AI will never silently modify your calendar. Confirm to invoke real MCP tools.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      Decline / Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproving ? 'Executing Real Tools...' : 'Approve & Execute via MCP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Execution Summary Report after Approval */}
              {currentMission.status === 'COMPLETED' && executionSummary && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 mt-4">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" />
                      MCP Execution Summary &bull; 100% Succeeded
                    </span>
                    <span>{executionSummary.totalToolsExecuted} Real Operations Persisted</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    All approved study blocks have been written into MySQL / PostgreSQL and are immediately visible in{' '}
                    <strong className="text-white">Study Planner</strong> and <strong className="text-white">My Tasks</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Audit Steps Timeline */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              State Machine Execution Trace
            </h3>
            {currentMission.steps?.map((step) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs"
              >
                <span
                  className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {step.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-200">{step.stepName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Missions History */}
      {missions.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Compass className="w-4 h-4 text-violet-400" />
            Previous Missions &amp; Autonomous Workflows ({missions.length})
          </h2>
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => setCurrentMission(m)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  currentMission?.id === m.id
                    ? 'bg-slate-800/60 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/70 hover:bg-slate-800/40'
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-bold text-slate-100 truncate">Mission #{m.id}: {m.goal}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(m.createdAt).toLocaleDateString()} &bull; {m.dailyHoursAvailable}h/day &bull;{' '}
                    {m.conflictsDetected} conflicts
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    m.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : m.status === 'AWAITING_APPROVAL'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
