'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Cpu,
  Trash2,
  Mic,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage } from '@/types';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello Alex! I'm your **NEXUS AI Assistant**, connected directly to your academic database via the **Model Context Protocol (MCP)**.\n\nI can execute actual tools on your behalf:\n- `listTasks`: Inspect your deadlines & assignments\n- `addTask`: Create new academic deliverables\n- `completeTask`: Mark assignments finished\n- `generateStudyPlan`: Generate structured study sessions in your schedule\n\nHow can I help you excel today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Pro');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    'Show my upcoming deadlines',
    'Create a study plan for next week',
    'Add a new task to review Algorithms due Friday',
    'Explain binary search trees vs AVL trees',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.sendChatMessage(textToSend.trim(), history);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        toolCalls: response.toolCalls,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Error executing request: ${err.message || 'Could not connect to backend server'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleMic = () => {
    setIsListening(true);
    setTimeout(() => {
      setInput('Create a study plan for next week');
      setIsListening(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col rounded-3xl bg-[#0d1424]/90 border border-slate-800/80 shadow-2xl overflow-hidden glass-panel">
      {/* Top Bar with Model Selector & Actions */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              NEXUS AI Assistant
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MCP Connected
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Streamable HTTP JSON-RPC 2.0 &bull; Tools Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              aria-label="Select AI Model"
              className="appearance-none bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 outline-none hover:border-violet-500/50 cursor-pointer"
            >
              <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
              <option value="GPT-4o">OpenAI GPT-4o</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="Local Ollama">Local Ollama (Llama 3)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-violet-400 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl space-y-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Tool Execution Badges if any */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="space-y-2 mb-2">
                  {m.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#090e1a] border border-cyan-500/30 shadow-md text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-cyan-300 mb-1.5">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Cpu className="w-3.5 h-3.5" />
                          Tool Executed: {tc.tool}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          {tc.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 rounded-lg p-2 font-mono overflow-x-auto">
                        <span className="text-violet-400 font-bold">Arguments: </span>
                        {JSON.stringify(tc.arguments)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md font-medium'
                    : 'bg-slate-800/40 border border-slate-700/60 text-slate-100 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                  {m.content}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 px-1">
                {m.timestamp}
              </span>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-3 text-slate-400 text-xs italic pl-2 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>Nexus AI is evaluating context & calling MCP tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Starters */}
      {messages.length < 3 && !isSending && (
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-900/40 flex flex-wrap gap-2">
          {starterPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 border border-slate-700/50 hover:border-violet-500/40 transition-all font-medium"
            >
              &gt; {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all"
        >
          <input
            type="text"
            placeholder={isListening ? 'Listening to voice command...' : 'Ask questions, manage tasks, or run MCP tools...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-medium"
          />

          <button
            type="button"
            onClick={handleMic}
            className={`p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors ${
              isListening ? 'text-cyan-400 animate-bounce' : ''
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shadow-md hover:scale-105"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
