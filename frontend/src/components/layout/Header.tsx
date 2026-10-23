'use client';

import React, { useState } from 'react';
import { Search, Bell, Sun, ChevronDown } from 'lucide-react';
import { SearchModal } from './SearchModal';
import Link from 'next/link';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-[#080d1a]/80 backdrop-blur-md sticky top-0 z-20 select-none">
        {/* Search Bar matching screenshot */}
        <div className="w-full max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-700/60 text-slate-400 text-xs font-medium transition-all group shadow-sm hover:border-violet-500/40"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search tasks, subjects, or ask Nexus...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right side status & profile */}
        <div className="flex items-center gap-6">
          {/* Greeting */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div>
              <span className="font-semibold text-slate-200">Good morning, Alex</span>
              <span className="text-slate-400 mx-1.5">&mdash;</span>
              <span className="text-slate-400">Ready to make today count?</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadNotifications > 0) setUnreadNotifications(0);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080d1a] animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
                  <span>Notifications</span>
                  <span className="text-[10px] text-cyan-400 font-normal">All caught up</span>
                </div>
                <div className="space-y-2 mt-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <p className="font-medium text-slate-100">Java assignment due today</p>
                    <p className="text-[11px] text-slate-400">Scheduled focus block starts at 2:00 PM</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <p className="font-medium text-slate-100">Weekly progress at 87%</p>
                    <p className="text-[11px] text-slate-400">You are ahead of your 20h study goal</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <p className="font-medium text-slate-100">MCP tool synchronized</p>
                    <p className="text-[11px] text-slate-400">All 4 tools active on Streamable HTTP</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link href="/settings" className="flex items-center gap-2.5 pl-2 group">
            <div className="w-8 h-8 rounded-full ring-2 ring-violet-500/50 overflow-hidden bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Alex</p>
              <p className="text-[10px] text-slate-400 leading-tight">CS &bull; 4th Year</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
          </Link>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
