'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Code2,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { McpTool, McpToolExecutionLog } from '@/types';

export default function McpActivityPage() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [logs, setLogs] = useState<McpToolExecutionLog[]>([]);
  const [selectedToolFilter, setSelectedToolFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Playground Console State
  const [testTool, setTestTool] = useState('listTasks');
  const [testArgsJson, setTestArgsJson] = useState('{\n  "status": "PENDING"\n}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecutingTest, setIsExecutingTest] = useState(false);

  // Payload Inspection Modal
  const [inspectLog, setInspectLog] = useState<McpToolExecutionLog | null>(null);

  const loadMcpData = async () => {
    try {
      setIsLoading(true);
      const [toolList, logList] = await Promise.all([
        api.getMcpTools(),
        api.getMcpLogs(0, 30, selectedToolFilter),
      ]);
      setTools(toolList);
      setLogs(logList);
    } catch (err) {
      console.error('Failed to load MCP telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMcpData();
  }, [selectedToolFilter]);

  const handleToolPreset = (toolName: string) => {
    setTestTool(toolName);
    switch (toolName) {
      case 'listTasks':
        setTestArgsJson('{\n  "status": "ALL"\n}');
        break;
      case 'addTask':
        setTestArgsJson(
          '{\n  "title": "Practice AVL Tree Balance",\n  "subject": "Data Structures",\n  "priority": "HIGH",\n  "dueDate": "2026-10-24",\n  "estimatedMinutes": 60\n}'
        );
        break;
      case 'completeTask':
        setTestArgsJson('{\n  "taskId": 1\n}');
        break;
      case 'generateStudyPlan':
        setTestArgsJson(
          '{\n  "subject": "Distributed Systems",\n  "examDate": "2026-10-28",\n  "dailyHoursAvailable": 2.5,\n  "topics": ["Raft Consensus", "CAP Theorem", "Vector Clocks"]\n}'
        );
        break;
    }
  };

  const handleExecuteConsole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecutingTest(true);
    setTestResult(null);

    try {
      const parsedArgs = JSON.parse(testArgsJson);
      const res = await api.executeMcpTool(testTool, parsedArgs);
      setTestResult(res);
      await loadMcpData(); // Refresh logs
    } catch (err: any) {
      setTestResult({ error: err.message || 'JSON parsing or tool execution failed' });
    } finally {
      setIsExecutingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-violet-400" />
            Model Context Protocol (MCP) Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tool invocation logs, JSON-RPC 2.0 audit trail, and interactive test console.
          </p>
        </div>

        <button
          onClick={loadMcpData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 4 Tool Cards with Live Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((t) => (
          <div
            key={t.name}
            className="p-4 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-cyan-300">{t.name}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {t.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{t.description}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Total Calls</span>
              <span className="font-extrabold text-white font-mono">{t.executionCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Pipeline Flow Diagram matching Master Prompt */}
      <div className="p-5 rounded-3xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          End-to-End Architectural Pipeline Flow
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="font-bold text-white">1. User / Alexa+</span>
          </div>
          <span className="text-slate-500 font-extrabold">&rarr;</span>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-violet-500/40 text-violet-300">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-bold">2. AI Agent Orchestrator</span>
          </div>
          <span className="text-slate-500 font-extrabold">&rarr;</span>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold">3. Streamable HTTP MCP Tool</span>
          </div>
          <span className="text-slate-500 font-extrabold">&rarr;</span>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-indigo-500/40 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="font-bold">4. Spring Boot Service</span>
          </div>
          <span className="text-slate-500 font-extrabold">&rarr;</span>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">5. MySQL 8.4 Database</span>
          </div>
          <span className="text-slate-500 font-extrabold">&rarr;</span>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-bold">6. Validated Response</span>
          </div>
        </div>
      </div>

      {/* Playground Test Console & Live Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Interactive Test Console */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="pb-3 border-b border-slate-800/70">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live MCP Tool Playground
            </h2>
            <p className="text-xs text-slate-400">Execute tools directly over Streamable HTTP</p>
          </div>

          {/* Quick Tool Selector Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['listTasks', 'addTask', 'completeTask', 'generateStudyPlan'].map((toolName) => (
              <button
                key={toolName}
                type="button"
                onClick={() => handleToolPreset(toolName)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                  testTool === toolName
                    ? 'bg-violet-600 text-white font-bold shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {toolName}
              </button>
            ))}
          </div>

          <form onSubmit={handleExecuteConsole} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                JSON-RPC Arguments Payload
              </label>
              <textarea
                rows={6}
                value={testArgsJson}
                onChange={(e) => setTestArgsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-cyan-300 outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isExecutingTest}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition-all hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecutingTest ? 'Dispatching JSON-RPC Call...' : 'Execute Tool via MCP'}</span>
            </button>
          </form>

          {/* Execution Result Box */}
          {testResult && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-200">Execution Output</span>
                {testResult.executionDurationMs && (
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {testResult.executionDurationMs} ms
                  </span>
                )}
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 max-h-48 overflow-y-auto overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Execution Audit Log Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" />
                Audit Logs ({logs.length})
              </h2>
              <p className="text-xs text-slate-400">Persisted in mcp_tool_execution_logs</p>
            </div>

            {/* Tool Filter */}
            <select
              value={selectedToolFilter}
              onChange={(e) => setSelectedToolFilter(e.target.value)}
              aria-label="Filter Audit Logs by Tool"
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none hover:border-slate-600"
            >
              <option value="ALL">All Tools</option>
              <option value="listTasks">listTasks</option>
              <option value="addTask">addTask</option>
              <option value="completeTask">completeTask</option>
              <option value="generateStudyPlan">generateStudyPlan</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                  <th className="pb-2.5">Tool Name</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Duration</th>
                  <th className="pb-2.5">Client</th>
                  <th className="pb-2.5 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono text-cyan-300 font-bold">{log.toolName}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle className="w-2.5 h-2.5" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{log.executionDurationMs} ms</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[100px]">{log.clientInfo}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="text-violet-400 hover:text-cyan-300 font-semibold text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#0e1628] border border-violet-500/40 rounded-3xl p-6 shadow-2xl glass-panel relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                MCP Execution Log #{inspectLog.id} &bull; {inspectLog.toolName}
              </h2>
              <button onClick={() => setInspectLog(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <p className="text-slate-400 font-bold mb-1">Input Arguments (JSON):</p>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto max-h-40">
                  {inspectLog.argumentsJson}
                </pre>
              </div>

              <div>
                <p className="text-slate-400 font-bold mb-1">Tool Result / Response (JSON):</p>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto max-h-48">
                  {inspectLog.resultJson}
                </pre>
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800 font-sans text-xs">
                <span>Executed at: {new Date(inspectLog.executedAt).toLocaleString()}</span>
                <span>Latency: {inspectLog.executionDurationMs} ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
