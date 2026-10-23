package com.nexus.ai.dto;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsDto {

    public record Overview(
            long activeTasks,
            long upcomingDeadlines,
            double focusHoursThisWeek,
            int weeklyProgressPercent,
            String activeTasksDelta,
            String deadlinesDelta,
            String focusHoursDelta,
            String progressDelta
    ) {}

    public record ActivityPoint(
            String dayLabel,       // "Mon", "Tue", etc.
            LocalDate date,
            double focusHours,
            long tasksCompleted
    ) {}

    public record SubjectDistribution(
            String subject,
            double focusHours,
            long taskCount,
            int percentage
    ) {}

    public record AiInsight(
            String id,
            String title,
            String description,
            String icon,           // "check", "clock", "arrow-right"
            String badgeText
    ) {}

    public record FullAnalyticsResponse(
            Overview overview,
            List<ActivityPoint> activityTrend,
            List<SubjectDistribution> subjectBreakdown,
            List<AiInsight> insights
    ) {}
}
