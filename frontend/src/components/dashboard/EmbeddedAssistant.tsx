'use client';

import React, { useState } from 'react';
import { Send, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export function EmbeddedAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; tools?: string[] }>>([
    {
      role: 'assistant',
      text: "Hi Alex! 👋 I'm your Nexus AI assistant. I can help you with your tasks, study plans, deadlines, and answer questions. What would you like to do today?",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const promptStarters = [
    'Show my upcoming deadlines',
    'Create a study plan for next week',
    'Add a new task',
    'Explain a difficult topic',
  ];

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userText = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsSending(true);

    try {
      const res = await api.sendChatMessage(userText);
      const executedTools = res.toolCalls?.map((tc) => tc.tool) || [];
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          tools: executedTools,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Failed to reach AI assistant'}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-5 shadow-md flex flex-col justify-between h-[390px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>Online</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-2xl p-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.tools && m.tools.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {m.tools.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      MCP: {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-line">{m.text}</div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
            <span>Nexus AI is thinking & orchestrating MCP tools...</span>
          </div>
        )}

        {/* Prompt Starter Chips (show when only initial greeting) */}
        {messages.length === 1 && !isSending && (
          <div className="space-y-1.5 pt-2">
            {promptStarters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => handleSendPrompt(starter)}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 hover:border-violet-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group"
              >
                <span>&gt; {starter}</span>
                <Sparkles className="w-3 h-3 text-violet-400/50 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Field matching screenshot */}
      <div className="pt-2 border-t border-slate-800/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-center rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 shadow-inner"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
