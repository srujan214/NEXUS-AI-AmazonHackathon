package com.nexus.ai.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.dto.AnalyticsDto;
import com.nexus.ai.dto.ScheduleDto;
import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import com.nexus.ai.service.AnalyticsService;
import com.nexus.ai.service.ScheduleService;
import com.nexus.ai.service.TaskService;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class McpToolRegistry {

    private final TaskService taskService;
    private final ScheduleService scheduleService;
    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    public McpToolRegistry(
            TaskService taskService,
            ScheduleService scheduleService,
            AnalyticsService analyticsService,
            ObjectMapper objectMapper) {
        this.taskService = taskService;
        this.scheduleService = scheduleService;
        this.analyticsService = analyticsService;
        this.objectMapper = objectMapper;
    }

    public List<McpProtocol.ToolDefinition> getToolDefinitions() {
        return List.of(
                new McpProtocol.ToolDefinition(
                        "create_task",
                        "Create a new academic assignment, deliverable, or project task in NEXUS AI.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "title", Map.of("type", "string", "description", "Title of the task"),
                                        "subject", Map.of("type", "string", "description", "Course/subject (e.g. 'Java 25', 'Algorithms')"),
                                        "priority", Map.of("type", "string", "enum", List.of("LOW", "MEDIUM", "HIGH")),
                                        "dueDate", Map.of("type", "string", "description", "ISO date-time or YYYY-MM-DD"),
                                        "description", Map.of("type", "string", "description", "Optional assignment details"),
                                        "estimatedMinutes", Map.of("type", "integer", "description", "Estimated minutes to complete")
                                ),
                                "required", List.of("title", "subject", "dueDate")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "list_tasks",
                        "List tasks with optional filters by status, academic subject, or priority.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "status", Map.of("type", "string", "enum", List.of("ALL", "PENDING", "IN_PROGRESS", "COMPLETED")),
                                        "subject", Map.of("type", "string", "description", "Filter by course"),
                                        "priority", Map.of("type", "string", "enum", List.of("ALL", "LOW", "MEDIUM", "HIGH"))
                                )
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "update_task",
                        "Update an existing task's title, subject, priority, status, or deadline.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "taskId", Map.of("type", "integer", "description", "ID of task to update"),
                                        "title", Map.of("type", "string"),
                                        "subject", Map.of("type", "string"),
                                        "priority", Map.of("type", "string", "enum", List.of("LOW", "MEDIUM", "HIGH")),
                                        "status", Map.of("type", "string", "enum", List.of("PENDING", "IN_PROGRESS", "COMPLETED")),
                                        "dueDate", Map.of("type", "string"),
                                        "estimatedMinutes", Map.of("type", "integer")
                                ),
                                "required", List.of("taskId")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "complete_task",
                        "Mark a task as completed in the database and update completion metrics.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "taskId", Map.of("type", "integer", "description", "Task ID to complete")
                                ),
                                "required", List.of("taskId")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "delete_task",
                        "Delete an academic task from the database.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "taskId", Map.of("type", "integer", "description", "Task ID to delete")
                                ),
                                "required", List.of("taskId")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "get_upcoming_deadlines",
                        "Retrieve all assignments and exams due within the next N days.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "daysAhead", Map.of("type", "integer", "description", "Number of days ahead to look (default: 3)")
                                )
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "create_study_session",
                        "Schedule a focused study session block in the student calendar.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "title", Map.of("type", "string", "description", "Session title"),
                                        "subject", Map.of("type", "string", "description", "Subject"),
                                        "startTime", Map.of("type", "string", "description", "ISO timestamp"),
                                        "endTime", Map.of("type", "string", "description", "ISO timestamp"),
                                        "durationMinutes", Map.of("type", "integer"),
                                        "taskId", Map.of("type", "integer")
                                ),
                                "required", List.of("title", "subject", "startTime", "endTime")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "list_study_sessions",
                        "Retrieve scheduled study sessions within a given time range.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "startTime", Map.of("type", "string"),
                                        "endTime", Map.of("type", "string")
                                )
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "reschedule_study_session",
                        "Move an existing study block to a new time slot.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "sessionId", Map.of("type", "integer"),
                                        "newStartTime", Map.of("type", "string"),
                                        "newEndTime", Map.of("type", "string")
                                ),
                                "required", List.of("sessionId", "newStartTime", "newEndTime")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "detect_schedule_conflicts",
                        "Inspect calendar for overlapping study sessions or overloaded time slots.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "startTime", Map.of("type", "string", "description", "Start window to check"),
                                        "endTime", Map.of("type", "string", "description", "End window to check")
                                ),
                                "required", List.of("startTime", "endTime")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "generate_study_plan",
                        "Generate a day-by-day study schedule milestone plan for an upcoming exam or assignment.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "subject", Map.of("type", "string"),
                                        "examDate", Map.of("type", "string"),
                                        "dailyHoursAvailable", Map.of("type", "number"),
                                        "topics", Map.of("type", "array", "items", Map.of("type", "string"))
                                ),
                                "required", List.of("subject", "examDate", "dailyHoursAvailable", "topics")
                        )
                ),
                new McpProtocol.ToolDefinition(
                        "get_productivity_summary",
                        "Compute real SQL-backed productivity metrics, focus hours, and weekly progress percentage.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of()
                        )
                )
        );
    }

    public Object executeTool(String toolName, Map<String, Object> arguments) throws Exception {
        Map<String, Object> args = arguments != null ? arguments : Collections.emptyMap();
        String normalized = toolName.toLowerCase().replace("-", "_");

        // Tool 1: create_task / addTask
        if (normalized.equals("create_task") || normalized.equals("addtask")) {
            String title = (String) args.get("title");
            if (title == null || title.isBlank()) throw new IllegalArgumentException("Missing title");
            String subject = (String) args.getOrDefault("subject", "General");
            String desc = (String) args.get("description");

            String priorityStr = (String) args.getOrDefault("priority", "MEDIUM");
            Priority priority;
            try {
                priority = Priority.valueOf(priorityStr.toUpperCase());
            } catch (Exception e) {
                priority = Priority.MEDIUM;
            }

            Instant dueDate = parseInstant(args.get("dueDate"));
            Number estMins = (Number) args.getOrDefault("estimatedMinutes", 60);

            return taskService.createTask(new TaskDto.CreateRequest(title, desc, subject, priority, dueDate, estMins.intValue()));
        }

        // Tool 2: list_tasks / listTasks
        if (normalized.equals("list_tasks") || normalized.equals("listtasks")) {
            String statusStr = (String) args.get("status");
            TaskStatus status = parseStatus(statusStr);
            String priorityStr = (String) args.get("priority");
            Priority priority = parsePriority(priorityStr);
            String subject = (String) args.get("subject");
            return taskService.getTasks(status, priority, subject, null, "dueDate");
        }

        // Tool 3: update_task
        if (normalized.equals("update_task") || normalized.equals("updatetask")) {
            Long taskId = getLong(args, "taskId");
            TaskDto.Response existing = taskService.getTaskById(taskId);
            String title = (String) args.getOrDefault("title", existing.title());
            String subject = (String) args.getOrDefault("subject", existing.subject());
            String desc = (String) args.getOrDefault("description", existing.description());
            Priority priority = args.containsKey("priority") ? parsePriority((String) args.get("priority")) : existing.priority();
            TaskStatus status = args.containsKey("status") ? parseStatus((String) args.get("status")) : existing.status();
            Instant dueDate = args.containsKey("dueDate") ? parseInstant(args.get("dueDate")) : existing.dueDate();
            Number est = (Number) args.getOrDefault("estimatedMinutes", existing.estimatedMinutes());

            return taskService.updateTask(taskId, new TaskDto.UpdateRequest(title, desc, subject, priority, status, dueDate, est.intValue()));
        }

        // Tool 4: complete_task / completeTask
        if (normalized.equals("complete_task") || normalized.equals("completetask")) {
            Long taskId = getLong(args, "taskId");
            return taskService.toggleTask(taskId);
        }

        // Tool 5: delete_task / deleteTask
        if (normalized.equals("delete_task") || normalized.equals("deletetask")) {
            Long taskId = getLong(args, "taskId");
            taskService.deleteTask(taskId);
            return Map.of("taskId", taskId, "deleted", true, "status", "SUCCESS");
        }

        // Tool 6: get_upcoming_deadlines
        if (normalized.equals("get_upcoming_deadlines") || normalized.equals("getupcomingdeadlines")) {
            Number daysAhead = (Number) args.getOrDefault("daysAhead", 3);
            Instant threshold = Instant.now().plus(daysAhead.intValue(), ChronoUnit.DAYS);
            List<TaskDto.Response> allActive = taskService.getTasks(TaskStatus.PENDING, null, null, null, "dueDate");
            return allActive.stream()
                    .filter(t -> !t.dueDate().isAfter(threshold))
                    .toList();
        }

        // Tool 7: create_study_session
        if (normalized.equals("create_study_session") || normalized.equals("createstudysession")) {
            String title = (String) args.get("title");
            String subject = (String) args.getOrDefault("subject", "General");
            Instant start = parseInstant(args.get("startTime"));
            Instant end = parseInstant(args.get("endTime"));
            Number dur = (Number) args.getOrDefault("durationMinutes", 60);
            Long taskId = args.containsKey("taskId") ? getLong(args, "taskId") : null;

            return scheduleService.createSession(new ScheduleDto.CreateRequest(title, subject, start, end, dur.intValue(), taskId, null));
        }

        // Tool 8: list_study_sessions
        if (normalized.equals("list_study_sessions") || normalized.equals("liststudysessions")) {
            Instant start = args.containsKey("startTime") ? parseInstant(args.get("startTime")) : null;
            Instant end = args.containsKey("endTime") ? parseInstant(args.get("endTime")) : null;
            return scheduleService.getSchedule(start, end);
        }

        // Tool 9: reschedule_study_session
        if (normalized.equals("reschedule_study_session") || normalized.equals("reschedulestudysession")) {
            Long sessionId = getLong(args, "sessionId");
            Instant newStart = parseInstant(args.get("newStartTime"));
            Instant newEnd = parseInstant(args.get("newEndTime"));
            int duration = (int) ChronoUnit.MINUTES.between(newStart, newEnd);

            List<ScheduleDto.Response> all = scheduleService.getSchedule(null, null);
            ScheduleDto.Response target = all.stream().filter(s -> s.id().equals(sessionId)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

            return scheduleService.updateSession(sessionId, new ScheduleDto.UpdateRequest(
                    target.title(), target.subject(), newStart, newEnd, duration, target.status(), target.taskId(), "Rescheduled"
            ));
        }

        // Tool 10: detect_schedule_conflicts
        if (normalized.equals("detect_schedule_conflicts") || normalized.equals("detectscheduleconflicts")) {
            Instant start = parseInstant(args.get("startTime"));
            Instant end = parseInstant(args.get("endTime"));
            List<ScheduleDto.Response> sessions = scheduleService.getSchedule(start.minus(1, ChronoUnit.DAYS), end.plus(1, ChronoUnit.DAYS));

            List<ScheduleDto.Response> conflicts = new ArrayList<>();
            for (ScheduleDto.Response s : sessions) {
                // Overlap: s.start < end && s.end > start
                if (s.startTime().isBefore(end) && s.endTime().isAfter(start)) {
                    conflicts.add(s);
                }
            }
            return Map.of(
                    "conflictCount", conflicts.size(),
                    "hasConflicts", !conflicts.isEmpty(),
                    "conflictingSessions", conflicts
            );
        }

        // Tool 11: generate_study_plan / generateStudyPlan
        if (normalized.equals("generate_study_plan") || normalized.equals("generatestudyplan")) {
            String subject = (String) args.get("subject");
            if (subject == null || subject.isBlank()) throw new IllegalArgumentException("Missing subject");
            String examDateStr = (String) args.get("examDate");
            LocalDate examDate = examDateStr != null ? LocalDate.parse(examDateStr.substring(0, 10)) : LocalDate.now().plusDays(7);
            Number dailyHoursNum = (Number) args.getOrDefault("dailyHoursAvailable", 2.0);
            double dailyHours = dailyHoursNum.doubleValue();

            List<String> topics = new ArrayList<>();
            Object topicsObj = args.get("topics");
            if (topicsObj instanceof List<?> list) {
                for (Object item : list) topics.add(String.valueOf(item));
            }
            if (topics.isEmpty()) {
                topics = List.of("Core Concepts & Review", "Problem Solving Practice", "Final Exam Simulation");
            }

            List<ScheduleDto.Response> createdSessions = new ArrayList<>();
            LocalDate curr = LocalDate.now();
            int dayOffset = 1;
            int durationMinutes = (int) Math.round(dailyHours * 60);

            for (String topic : topics) {
                LocalDate sessionDate = curr.plusDays(dayOffset);
                if (sessionDate.isAfter(examDate)) break;

                Instant start = sessionDate.atTime(10, 0).toInstant(ZoneOffset.UTC);
                Instant end = start.plus(durationMinutes, ChronoUnit.MINUTES);

                ScheduleDto.CreateRequest req = new ScheduleDto.CreateRequest(
                        subject + ": " + topic,
                        subject,
                        start,
                        end,
                        durationMinutes,
                        null,
                        "Generated by NEXUS AI MCP Tool"
                );
                createdSessions.add(scheduleService.createSession(req));
                dayOffset++;
            }

            return Map.of(
                    "subject", subject,
                    "examDate", examDate.toString(),
                    "totalSessionsCreated", createdSessions.size(),
                    "dailyCommitmentMinutes", durationMinutes,
                    "sessions", createdSessions
            );
        }

        // Tool 12: get_productivity_summary
        if (normalized.equals("get_productivity_summary") || normalized.equals("getproductivitysummary")) {
            AnalyticsDto.Overview overview = analyticsService.getOverview();
            return Map.of(
                    "activeTasks", overview.activeTasks(),
                    "upcomingDeadlines", overview.upcomingDeadlines(),
                    "focusHoursThisWeek", overview.focusHoursThisWeek(),
                    "weeklyProgressPercent", overview.weeklyProgressPercent(),
                    "status", "OPTIMAL"
            );
        }

        throw new UnsupportedOperationException("Unknown MCP tool: " + toolName);
    }

    private Instant parseInstant(Object obj) {
        if (obj == null) return Instant.now().plus(2, ChronoUnit.DAYS);
        String str = obj.toString();
        if (str.length() == 10) {
            return LocalDate.parse(str).atTime(18, 0).toInstant(ZoneOffset.UTC);
        }
        return Instant.parse(str);
    }

    private TaskStatus parseStatus(String s) {
        if (s == null || s.equalsIgnoreCase("ALL")) return null;
        try {
            return TaskStatus.valueOf(s.toUpperCase());
        } catch (Exception e) {
            return null;
        }
    }

    private Priority parsePriority(String p) {
        if (p == null || p.equalsIgnoreCase("ALL")) return null;
        try {
            return Priority.valueOf(p.toUpperCase());
        } catch (Exception e) {
            return null;
        }
    }

    private Long getLong(Map<String, Object> args, String key) {
        Object v = args.get(key);
        if (v == null) throw new IllegalArgumentException("Missing required parameter: " + key);
        return ((Number) v).longValue();
    }
}
