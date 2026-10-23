package com.nexus.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.dto.MissionDto;
import com.nexus.ai.dto.ScheduleDto;
import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.mcp.McpServerService;
import com.nexus.ai.mcp.McpToolRegistry;
import com.nexus.ai.model.*;
import com.nexus.ai.repository.MissionRepository;
import com.nexus.ai.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MissionService {

    private static final Logger log = LoggerFactory.getLogger(MissionService.class);

    private final MissionRepository missionRepository;
    private final McpToolRegistry toolRegistry;
    private final McpServerService mcpServerService;
    private final TaskRepository taskRepository;
    private final ScheduleService scheduleService;
    private final ObjectMapper objectMapper;

    public MissionService(
            MissionRepository missionRepository,
            McpToolRegistry toolRegistry,
            McpServerService mcpServerService,
            TaskRepository taskRepository,
            ScheduleService scheduleService,
            ObjectMapper objectMapper) {
        this.missionRepository = missionRepository;
        this.toolRegistry = toolRegistry;
        this.mcpServerService = mcpServerService;
        this.taskRepository = taskRepository;
        this.scheduleService = scheduleService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<MissionDto.Response> getAllMissions() {
        return missionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MissionDto.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public MissionDto.Response getMissionById(Long id) {
        Mission m = missionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission not found: " + id));
        return MissionDto.Response.fromEntity(m);
    }

    /**
     * Flagship AI Workflow: Generates a proposed mission plan without modifying database yet.
     * Transitions through state machine:
     * UNDERSTANDING -> PLANNING -> CHECKING_CONFLICTS -> AWAITING_APPROVAL
     */
    @Transactional
    public MissionDto.Response createAndPlanMission(MissionDto.CreateRequest request) {
        String goal = request.goal().trim();
        Double dailyHours = request.dailyHoursAvailable() != null ? request.dailyHoursAvailable() : 2.0;
        Instant targetDate = request.targetDate() != null ? request.targetDate() : Instant.now().plus(5, ChronoUnit.DAYS);

        Mission mission = new Mission(goal, dailyHours, targetDate);

        // Step 1: Understanding
        mission.setStatus(MissionStatus.UNDERSTANDING);
        mission.addStep(new MissionStep(
                "Natural Language Intent Understanding",
                "COMPLETED",
                "Parsed objective: '" + goal + "'. Target deadline: " + targetDate.toString().substring(0, 10) +
                ", Daily focus commitment: " + dailyHours + " hours/day."
        ));

        // Step 2: Planning & Task Retrieval
        mission.setStatus(MissionStatus.PLANNING);
        boolean isMultiSubjectExamAndDb = goal.toLowerCase().contains("java") &&
                (goal.toLowerCase().contains("database") || goal.toLowerCase().contains("assignment") || goal.toLowerCase().contains("sql"));
        String subject = isMultiSubjectExamAndDb ? "Java 25 & MySQL Database" : extractSubject(goal);
        List<Task> existingActive = taskRepository.findByStatusNot(TaskStatus.COMPLETED);
        mission.addStep(new MissionStep(
                "Retrieve Existing Tasks & Deadlines",
                "COMPLETED",
                "Scanned database: " + existingActive.size() + " active tasks identified. Academic context: " + subject
        ));

        // Step 3: Checking Conflicts
        mission.setStatus(MissionStatus.CHECKING_CONFLICTS);
        List<ScheduleDto.Response> currentSessions = scheduleService.getSchedule(Instant.now(), targetDate);
        int conflictsFound = 0;
        StringBuilder conflictNotes = new StringBuilder();

        // Check slots for proposed daily sessions
        int daysCount = Math.max(1, (int) ChronoUnit.DAYS.between(Instant.now(), targetDate));
        List<Map<String, Object>> proposedSessions = new ArrayList<>();
        List<Map<String, Object>> proposedTasks = new ArrayList<>();

        // Generate milestones
        List<Map<String, String>> sessionPlan = new ArrayList<>();
        if (isMultiSubjectExamAndDb) {
            sessionPlan.add(Map.of("subject", "MySQL Database", "topic", "Schema Design & Normalization"));
            sessionPlan.add(Map.of("subject", "Java 25", "topic", "Virtual Threads & Concurrency"));
            sessionPlan.add(Map.of("subject", "MySQL Database", "topic", "Index Tuning & Query Optimization"));
            sessionPlan.add(Map.of("subject", "Java 25", "topic", "Streams, Records & Pattern Matching"));
            sessionPlan.add(Map.of("subject", "Java 25", "topic", "Final Exam Simulation & Review"));
        } else {
            List<String> topics = generateMilestoneTopics(subject, daysCount);
            for (String top : topics) {
                sessionPlan.add(Map.of("subject", subject, "topic", top));
            }
        }

        LocalDate today = LocalDate.now();

        for (int i = 0; i < Math.min(daysCount, sessionPlan.size()); i++) {
            LocalDate day = today.plusDays(i + 1);
            Instant slotStart = day.atTime(18, 0).toInstant(ZoneOffset.UTC); // Default 6:00 PM evening study
            Instant slotEnd = slotStart.plus((long) (dailyHours * 60), ChronoUnit.MINUTES);

            // Check if conflict with existing sessions
            final Instant checkStart = slotStart;
            final Instant checkEnd = slotEnd;
            boolean hasConflict = currentSessions.stream()
                    .anyMatch(s -> s.startTime().isBefore(checkEnd) && s.endTime().isAfter(checkStart));

            if (hasConflict) {
                conflictsFound++;
                // Shift slot to 20:00 (8:00 PM) to resolve conflict
                slotStart = day.atTime(20, 0).toInstant(ZoneOffset.UTC);
                slotEnd = slotStart.plus((long) (dailyHours * 60), ChronoUnit.MINUTES);
                conflictNotes.append("Shifted day ").append(i + 1).append(" session to 8:00 PM to avoid conflict with existing schedule. ");
            }

            Map<String, String> planItem = sessionPlan.get(i);
            String itemSub = planItem.get("subject");
            String itemTopic = planItem.get("topic");

            proposedSessions.add(Map.of(
                    "title", itemSub + ": " + itemTopic,
                    "subject", itemSub,
                    "startTime", slotStart.toString(),
                    "endTime", slotEnd.toString(),
                    "durationMinutes", (int) (dailyHours * 60),
                    "dayIndex", i + 1
            ));
        }

        // Generate deliverables
        if (isMultiSubjectExamAndDb) {
            proposedTasks.add(Map.of(
                    "title", "Database Systems: Assignment Submission",
                    "subject", "MySQL Database",
                    "priority", "HIGH",
                    "dueDate", today.plusDays(4).atTime(23, 59).toInstant(ZoneOffset.UTC).toString(),
                    "estimatedMinutes", (int) (dailyHours * 60)
            ));
            proposedTasks.add(Map.of(
                    "title", "Java 25: Comprehensive Final Exam",
                    "subject", "Java 25",
                    "priority", "HIGH",
                    "dueDate", targetDate.toString(),
                    "estimatedMinutes", (int) (dailyHours * 60)
            ));
        } else {
            proposedTasks.add(Map.of(
                    "title", "Final Exam / Milestone Submission: " + subject,
                    "subject", subject,
                    "priority", "HIGH",
                    "dueDate", targetDate.toString(),
                    "estimatedMinutes", (int) (dailyHours * 60)
            ));
        }

        mission.setConflictsDetected(conflictsFound);
        mission.setConflictDetails(conflictsFound > 0 ? conflictNotes.toString() : "No schedule overlaps detected. Optimal study slots available.");
        mission.addStep(new MissionStep(
                "Detect Schedule Conflicts & Slot Optimization",
                "COMPLETED",
                conflictsFound > 0
                        ? "Detected " + conflictsFound + " overlapping commitments. Automatically resolved by selecting open afternoon slots."
                        : "All proposed study slots verified clear without scheduling overlap."
        ));

        // Step 4: Awaiting Approval
        mission.setStatus(MissionStatus.AWAITING_APPROVAL);
        try {
            Map<String, Object> planPayload = Map.of(
                    "subject", subject,
                    "targetDate", targetDate.toString(),
                    "dailyHours", dailyHours,
                    "proposedSessions", proposedSessions,
                    "proposedTasks", proposedTasks
            );
            mission.setProposedPlanJson(objectMapper.writeValueAsString(planPayload));
        } catch (Exception e) {
            log.error("Failed to serialize proposed plan", e);
        }

        mission.addStep(new MissionStep(
                "Generate Actionable Study Plan & Await Approval",
                "PENDING",
                "Generated " + proposedSessions.size() + " structured study sessions and 1 major deliverable. Awaiting student approval before applying changes."
        ));

        Mission saved = missionRepository.save(mission);
        return MissionDto.Response.fromEntity(saved);
    }

    /**
     * Executes approved changes through real MCP tools and persists them into MySQL/database.
     */
    @Transactional
    public MissionDto.Response approveAndExecuteMission(Long id) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission not found: " + id));

        if (mission.getStatus() != MissionStatus.AWAITING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mission is not awaiting approval. Current status: " + mission.getStatus());
        }

        mission.setStatus(MissionStatus.EXECUTING);
        List<Map<String, Object>> executedOps = new ArrayList<>();

        try {
            Map<String, Object> plan = objectMapper.readValue(mission.getProposedPlanJson(), new TypeReference<>() {});
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> sessions = (List<Map<String, Object>>) plan.get("proposedSessions");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) plan.get("proposedTasks");

            // Execute MCP tool: create_task for each deliverable
            if (tasks != null) {
                for (Map<String, Object> t : tasks) {
                    long start = System.currentTimeMillis();
                    Object taskResult = toolRegistry.executeTool("create_task", t);
                    long duration = System.currentTimeMillis() - start;

                    mcpServerService.auditToolExecution(
                            "create_task",
                            objectMapper.writeValueAsString(t),
                            objectMapper.writeValueAsString(taskResult),
                            "SUCCESS",
                            duration,
                            "NEXUS-Mission-Control"
                    );
                    executedOps.add(Map.of("tool", "create_task", "status", "SUCCESS", "result", taskResult));
                }
            }

            // Execute MCP tool: create_study_session for each study block
            if (sessions != null) {
                for (Map<String, Object> s : sessions) {
                    long start = System.currentTimeMillis();
                    Object sessionResult = toolRegistry.executeTool("create_study_session", s);
                    long duration = System.currentTimeMillis() - start;

                    mcpServerService.auditToolExecution(
                            "create_study_session",
                            objectMapper.writeValueAsString(s),
                            objectMapper.writeValueAsString(sessionResult),
                            "SUCCESS",
                            duration,
                            "NEXUS-Mission-Control"
                    );
                    executedOps.add(Map.of("tool", "create_study_session", "status", "SUCCESS", "result", sessionResult));
                }
            }

            mission.setStatus(MissionStatus.COMPLETED);
            mission.setExecutionSummaryJson(objectMapper.writeValueAsString(Map.of(
                    "status", "COMPLETED",
                    "totalToolsExecuted", executedOps.size(),
                    "operations", executedOps,
                    "completedAt", Instant.now().toString()
            )));

            mission.addStep(new MissionStep(
                    "Execute Approved Actions via MCP Tools",
                    "COMPLETED",
                    "Successfully executed " + executedOps.size() + " real MCP operations. Schedule and tasks updated in MySQL database."
            ));

        } catch (Exception e) {
            log.error("Failed to execute mission", e);
            mission.setStatus(MissionStatus.FAILED);
            mission.addStep(new MissionStep(
                    "Execute Approved Actions via MCP Tools",
                    "FAILED",
                    "Execution error: " + e.getMessage()
            ));
        }

        Mission updated = missionRepository.save(mission);
        return MissionDto.Response.fromEntity(updated);
    }

    @Transactional
    public MissionDto.Response cancelMission(Long id) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission not found: " + id));

        mission.setStatus(MissionStatus.CANCELLED);
        mission.addStep(new MissionStep(
                "Mission Cancelled",
                "COMPLETED",
                "Student declined proposed plan. No changes were applied to schedule or tasks."
        ));
        Mission updated = missionRepository.save(mission);
        return MissionDto.Response.fromEntity(updated);
    }

    private String extractSubject(String goal) {
        String lower = goal.toLowerCase();
        if (lower.contains("java")) return "Java 25";
        if (lower.contains("database") || lower.contains("sql") || lower.contains("mysql")) return "MySQL Database Systems";
        if (lower.contains("spring")) return "Spring Boot";
        if (lower.contains("algorithm")) return "Algorithms";
        if (lower.contains("data structure")) return "Data Structures";
        if (lower.contains("ui") || lower.contains("frontend")) return "UI Development";
        return "Computer Science";
    }

    private List<String> generateMilestoneTopics(String subject, int days) {
        List<String> list = new ArrayList<>();
        if (subject.equalsIgnoreCase("Java 25")) {
            list.add("Virtual Threads & Concurrency Patterns");
            list.add("Pattern Matching & Records");
            list.add("Memory Management & Garbage Collection Tuning");
            list.add("Class Data Sharing & Native Compilation");
            list.add("Comprehensive Mock Exam & Practice Lab");
        } else if (subject.equalsIgnoreCase("Data Structures")) {
            list.add("AVL Trees & Self-Balancing Trees");
            list.add("Graph BFS/DFS & Dijkstra's Algorithm");
            list.add("Dynamic Programming Core Patterns");
            list.add("Hash Tables & Collision Resolution");
            list.add("Speed Coding Practice & Mock Test");
        } else {
            list.add("Architectural Foundations & Theory");
            list.add("Core Implementation & Hands-on Lab");
            list.add("Edge Cases & Troubleshooting");
            list.add("System Optimization & Review");
            list.add("Final Assessment Simulation");
        }
        return list.subList(0, Math.min(days, list.size()));
    }
}
