'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  CheckSquare,
  Calendar,
  BarChart2,
  Cpu,
  Settings,
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Mission Control', href: '/missions', icon: Compass, badge: 'Flagship' },
  { name: 'AI Assistant', href: '/assistant', icon: Sparkles },
  { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Study Planner', href: '/planner', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'MCP Activity', href: '/mcp', icon: Cpu },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-[#070b16] border-r border-slate-800/80 flex flex-col justify-between py-6 px-4 select-none relative z-30">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-3 py-2 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-lg tracking-wider">N</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-wide">NEXUS AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Turn ambition into action.</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/dashboard') || (item.href === '/mcp' && pathname === '/mcp-activity');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/25 to-cyan-600/10 text-white font-semibold border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Tagline matching reference mockup */}
      <div className="pt-6 border-t border-slate-800/60 px-3 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-violet-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Turn ambition</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          into action.<br />
          <span className="text-slate-200 font-semibold">Greater you.</span>
        </p>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 rounded-full blur-xl pointer-events-none" />
      </div>
    </aside>
  );
}
