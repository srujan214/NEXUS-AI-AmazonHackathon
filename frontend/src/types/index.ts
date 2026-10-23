export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'SKIPPED';

export interface Task {
  id: number;
  title: string;
  description?: string;
  subject: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  estimatedMinutes?: number;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySession {
  id: number;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: SessionStatus;
  taskId?: number | null;
  notes?: string;
  createdAt?: string;
}

export interface AnalyticsOverview {
  activeTasks: number;
  upcomingDeadlines: number;
  focusHoursThisWeek: number;
  weeklyProgressPercent: number;
  activeTasksDelta: string;
  deadlinesDelta: string;
  focusHoursDelta: string;
  progressDelta: string;
}

export interface ActivityPoint {
  dayLabel: string;
  date: string;
  focusHours: number;
  tasksCompleted: number;
}

export interface SubjectDistribution {
  subject: string;
  focusHours: number;
  taskCount: number;
  percentage: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeText: string;
}

export interface FullAnalytics {
  overview: AnalyticsOverview;
  activityTrend: ActivityPoint[];
  subjectBreakdown: SubjectDistribution[];
  insights: AiInsight[];
}

export interface McpTool {
  name: string;
  description: string;
  status: string;
  executionCount: number;
  inputSchema: any;
  sparkline: number[];
}

export interface McpToolExecutionLog {
  id: number;
  toolName: string;
  sessionId: string;
  argumentsJson: string;
  resultJson: string;
  status: string;
  executionDurationMs: number;
  clientInfo: string;
  executedAt: string;
}

export interface SystemSettings {
  id: number;
  studentName: string;
  studentEmail: string;
  academicMajor: string;
  weeklyFocusGoalHours: number;
  aiProvider: string;
  aiModel: string;
  hasCustomApiKey: boolean;
  apiKeyMasked?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{
    tool: string;
    arguments: any;
    result: any;
    status: string;
  }>;
  timestamp: string;
}
