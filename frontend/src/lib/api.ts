import {
  Task,
  StudySession,
  FullAnalytics,
  AnalyticsOverview,
  McpTool,
  McpToolExecutionLog,
  SystemSettings,
  Priority,
  TaskStatus,
} from '@/types';

export interface MissionStep {
  id: number;
  stepName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  details?: string;
  createdAt?: string;
}

export interface Mission {
  id: number;
  goal: string;
  status:
    | 'UNDERSTANDING'
    | 'PLANNING'
    | 'CHECKING_CONFLICTS'
    | 'AWAITING_APPROVAL'
    | 'EXECUTING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';
  targetDate?: string;
  dailyHoursAvailable: number;
  conflictsDetected: number;
  conflictDetails?: string;
  proposedPlanJson?: string;
  executionSummaryJson?: string;
  steps: MissionStep[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = typeof window !== 'undefined' ? '' : (process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let message = `API Error ${res.status}: ${res.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) message = parsed.message;
      else if (parsed.error) message = parsed.error;
    } catch {
      if (errorText) message = errorText;
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Tasks
  async getTasks(params?: { status?: string; priority?: string; subject?: string; query?: string; sortBy?: string }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') searchParams.set('priority', params.priority);
    if (params?.subject && params.subject !== 'ALL') searchParams.set('subject', params.subject);
    if (params?.query) searchParams.set('query', params.query);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);

    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}/api/tasks${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
    return handleResponse<Task[]>(res);
  },

  async createTask(data: {
    title: string;
    description?: string;
    subject: string;
    priority: Priority;
    dueDate: string;
    estimatedMinutes?: number;
  }): Promise<Task> {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async toggleTask(id: number): Promise<Task> {
    const res = await fetch(`${API_BASE}/api/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Schedule
  async getSchedule(start?: string, end?: string): Promise<StudySession[]> {
    const searchParams = new URLSearchParams();
    if (start) searchParams.set('start', start);
    if (end) searchParams.set('end', end);

    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}/api/schedule${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
    return handleResponse<StudySession[]>(res);
  },

  async createSession(data: {
    title: string;
    subject: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    taskId?: number | null;
    notes?: string;
  }): Promise<StudySession> {
    const res = await fetch(`${API_BASE}/api/schedule/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<StudySession>(res);
  },

  async deleteSession(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/schedule/session/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Analytics
  async getFullAnalytics(): Promise<FullAnalytics> {
    const res = await fetch(`${API_BASE}/api/analytics`, { cache: 'no-store' });
    return handleResponse<FullAnalytics>(res);
  },

  async getOverview(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/api/analytics/overview`, { cache: 'no-store' });
    return handleResponse<AnalyticsOverview>(res);
  },

  // MCP
  async getMcpTools(): Promise<McpTool[]> {
    const res = await fetch(`${API_BASE}/api/mcp/tools`, { cache: 'no-store' });
    return handleResponse<McpTool[]>(res);
  },

  async getMcpLogs(page = 0, size = 30, tool?: string): Promise<McpToolExecutionLog[]> {
    const searchParams = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (tool && tool !== 'ALL') searchParams.set('tool', tool);

    const res = await fetch(`${API_BASE}/api/mcp/logs?${searchParams.toString()}`, { cache: 'no-store' });
    return handleResponse<McpToolExecutionLog[]>(res);
  },

  async executeMcpTool(tool: string, args: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/api/mcp/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, arguments: args }),
    });
    return handleResponse<any>(res);
  },

  // Missions (Mission Control Flagship Feature)
  async getMissions(): Promise<Mission[]> {
    const res = await fetch(`${API_BASE}/api/missions`, { cache: 'no-store' });
    return handleResponse<Mission[]>(res);
  },

  async getMission(id: number): Promise<Mission> {
    const res = await fetch(`${API_BASE}/api/missions/${id}`, { cache: 'no-store' });
    return handleResponse<Mission>(res);
  },

  async planMission(goal: string, dailyHoursAvailable?: number, targetDate?: string): Promise<Mission> {
    const res = await fetch(`${API_BASE}/api/missions/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, dailyHoursAvailable, targetDate }),
    });
    return handleResponse<Mission>(res);
  },

  async approveMission(id: number): Promise<Mission> {
    const res = await fetch(`${API_BASE}/api/missions/${id}/approve`, {
      method: 'POST',
    });
    return handleResponse<Mission>(res);
  },

  async cancelMission(id: number): Promise<Mission> {
    const res = await fetch(`${API_BASE}/api/missions/${id}/cancel`, {
      method: 'POST',
    });
    return handleResponse<Mission>(res);
  },

  // AI Assistant
  async sendChatMessage(message: string, history?: Array<{ role: string; content: string }>): Promise<{
    reply: string;
    toolCalls?: Array<{ tool: string; arguments: any; result: any; status: string }>;
    timestamp: string;
  }> {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history || [] }),
    });
    return handleResponse<any>(res);
  },

  async getAiSuggestions(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/api/ai/suggestions`, { cache: 'no-store' });
    return handleResponse<string[]>(res);
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' });
    return handleResponse<SystemSettings>(res);
  },

  async updateSettings(data: {
    studentName: string;
    studentEmail?: string;
    academicMajor?: string;
    weeklyFocusGoalHours: number;
    aiProvider?: string;
    aiModel?: string;
    apiKey?: string;
  }): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<SystemSettings>(res);
  },

  async reseedData(): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE}/api/system/seed`, {
      method: 'POST',
    });
    return handleResponse<any>(res);
  },
};
