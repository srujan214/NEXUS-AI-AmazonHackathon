'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Key,
  Database,
  Cpu,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SystemSettings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [name, setName] = useState('Alex');
  const [email, setEmail] = useState('alex@nexus.edu');
  const [major, setMajor] = useState('Computer Science');
  const [weeklyGoal, setWeeklyGoal] = useState(20);

  // AI Configuration
  const [provider, setProvider] = useState('GEMINI');
  const [model, setModel] = useState('gemini-1.5-pro');
  const [apiKey, setApiKey] = useState('');

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [reseedNotice, setReseedNotice] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await api.getSettings();
        setSettings(s);
        setName(s.studentName);
        setEmail(s.studentEmail || '');
        setMajor(s.academicMajor || '');
        setWeeklyGoal(s.weeklyFocusGoalHours || 20);
        setProvider(s.aiProvider || 'GEMINI');
        setModel(s.aiModel || 'gemini-1.5-pro');
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const updated = await api.updateSettings({
        studentName: name.trim(),
        studentEmail: email.trim(),
        academicMajor: major.trim(),
        weeklyFocusGoalHours: Number(weeklyGoal),
        aiProvider: provider,
        aiModel: model,
        apiKey: apiKey.trim() || undefined,
      });

      setSettings(updated);
      setApiKey('');
      setSaveMessage('Settings updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePingMcp = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const res = await fetch('/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'ping', params: {} }),
      });
      const data = await res.json();
      if (data.result?.status === 'pong') {
        setPingStatus('SUCCESS: Streamable HTTP MCP server is healthy and responding with "pong" (Spec 2024-11-05).');
      } else {
        setPingStatus('Connected, but unexpected response: ' + JSON.stringify(data));
      }
    } catch (err: any) {
      setPingStatus('Ping failed: ' + err.message);
    } finally {
      setIsPinging(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('This will restore all active tasks, schedule sessions, and focus logs to the initial Alex dataset. Proceed?')) {
      return;
    }
    try {
      const res = await api.reseedData();
      setReseedNotice(res.message);
      setTimeout(() => setReseedNotice(''), 4000);
    } catch (err: any) {
      setReseedNotice(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-violet-400" />
          System Settings &amp; Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize student profile, configure AI model providers, and manage database seeds.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {saveMessage}
        </div>
      )}

      {reseedNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {reseedNotice}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Student Profile Card */}
        <div className="p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/70">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Student Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">University Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Academic Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Weekly Focus (Hours)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* 2. AI Model Provider Configuration Card */}
        <div className="p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">AI Engine &amp; API Key Configuration</h2>
            </div>
            {settings?.hasCustomApiKey && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Key Configured ({settings.apiKeyMasked})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500"
              >
                <option value="GEMINI">Google Gemini (Recommended)</option>
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic Claude</option>
                <option value="OLLAMA">Local Ollama</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                API Key (Stored securely server-side &bull; Never committed to git)
              </label>
              <input
                type="password"
                placeholder={settings?.hasCustomApiKey ? 'Enter new key to replace existing' : 'sk-... or AIzaSy...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-violet-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If no key is configured, NEXUS AI runs using its built-in student heuristic reasoning engine with full MCP tool support.
              </p>
            </div>
          </div>
        </div>

        {/* 3. MCP Server Status & Health Check Card */}
        <div className="p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/70">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Model Context Protocol Server</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
              <span className="text-slate-400">Streamable HTTP Endpoint:</span>
              <span className="text-cyan-300">POST /mcp</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
              <span className="text-slate-400">SSE Transport Endpoint:</span>
              <span className="text-violet-300">GET /mcp/sse</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePingMcp}
                disabled={isPinging}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                {isPinging ? 'Pinging MCP...' : 'Test Server Ping'}
              </button>

              {pingStatus && (
                <span className="text-[11px] text-emerald-400 font-semibold">{pingStatus}</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Database Seed & Reset Utility Card */}
        <div className="p-5 rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/70">
            <Database className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Sample Data &amp; Reset Utility</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <p className="text-slate-400">
              Restore the full student command center state matching the mockup with 12 active tasks, 7-day schedule, and focus metrics.
            </p>
            <button
              type="button"
              onClick={handleReseed}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset &amp; Reseed Data</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Preferences...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
