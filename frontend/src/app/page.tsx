'use client';

import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { TaskPreviewList } from '@/components/dashboard/TaskPreviewList';
import { ScheduleTimeline } from '@/components/dashboard/ScheduleTimeline';
import { EmbeddedAssistant } from '@/components/dashboard/EmbeddedAssistant';
import { McpToolsWidget } from '@/components/dashboard/McpToolsWidget';
import { AiInsightsWidget } from '@/components/dashboard/AiInsightsWidget';
import { api } from '@/lib/api';
import { Task, StudySession, FullAnalytics } from '@/types';

export default function OverviewPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [analytics, setAnalytics] = useState<FullAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedTasks, fetchedSessions, fetchedAnalytics] = await Promise.all([
        api.getTasks(),
        api.getSchedule(),
        api.getFullAnalytics(),
      ]);
      setTasks(fetchedTasks);
      setSessions(fetchedSessions);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.warn('Backend not yet started or loading fallback seed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Hero Section with Holographic Orb & Quick Ask Nexus */}
      <HeroSection />

      {/* 2. 4 Metric Cards */}
      <MetricCards overview={analytics?.overview} />

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Activity Chart, Task Preview, and 7-Day Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2-Column row: Your Activity & My Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityChart data={analytics?.activityTrend} />
            <TaskPreviewList initialTasks={tasks} onTasksChanged={loadData} />
          </div>

          {/* Wide 7-Day Schedule Timeline */}
          <ScheduleTimeline sessions={sessions} />
        </div>

        {/* Right Column (4 cols): AI Assistant, MCP Tools Connected, AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          <EmbeddedAssistant />
          <McpToolsWidget />
          <AiInsightsWidget insights={analytics?.insights} />
        </div>
      </div>
    </div>
  );
}
