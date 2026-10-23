package com.nexus.ai.service;

import com.nexus.ai.model.*;
import com.nexus.ai.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;
    private final StudySessionRepository studySessionRepository;
    private final FocusLogRepository focusLogRepository;
    private final McpToolExecutionLogRepository mcpLogRepository;
    private final SystemSettingsRepository settingsRepository;

    public DataInitializer(
            TaskRepository taskRepository,
            StudySessionRepository studySessionRepository,
            FocusLogRepository focusLogRepository,
            McpToolExecutionLogRepository mcpLogRepository,
            SystemSettingsRepository settingsRepository) {
        this.taskRepository = taskRepository;
        this.studySessionRepository = studySessionRepository;
        this.focusLogRepository = focusLogRepository;
        this.mcpLogRepository = mcpLogRepository;
        this.settingsRepository = settingsRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (taskRepository.count() == 0) {
            seedAll();
        }
    }

    @Transactional
    public void seedAll() {
        taskRepository.deleteAll();
        studySessionRepository.deleteAll();
        focusLogRepository.deleteAll();
        mcpLogRepository.deleteAll();
        settingsRepository.deleteAll();

        // 1. Settings
        SystemSettings settings = new SystemSettings("Alex", "alex@nexus.edu", "Computer Science", 20);
        settings.setAiProvider("GEMINI");
        settings.setAiModel("gemini-1.5-pro");
        settings.setHasCustomApiKey(false);
        settingsRepository.save(settings);

        // 2. Tasks
        Instant now = Instant.now();
        Instant today = now.plus(4, ChronoUnit.HOURS);
        Instant tomorrow = now.plus(1, ChronoUnit.DAYS);
        Instant in2Days = now.plus(2, ChronoUnit.DAYS);
        Instant in3Days = now.plus(3, ChronoUnit.DAYS);
        Instant in4Days = now.plus(4, ChronoUnit.DAYS);
        Instant in5Days = now.plus(5, ChronoUnit.DAYS);
        Instant in7Days = now.plus(7, ChronoUnit.DAYS);
        Instant in10Days = now.plus(10, ChronoUnit.DAYS);

        // 12 Active Tasks matching mockup + comprehensive student syllabus
        Task t1 = new Task("Complete Java assignment", "Implement binary search tree operations and unit tests", "Java 25", Priority.HIGH, today, 90);
        Task t2 = new Task("Build MCP server endpoints", "Expose Streamable HTTP MCP tools for student assistant", "Spring Boot", Priority.HIGH, today, 120);
        Task t3 = new Task("Read Spring AI documentation", "Review Tool Calling, Advisors and Model Context Protocol", "Spring AI", Priority.MEDIUM, tomorrow, 60);
        Task t4 = new Task("Prepare project demo video", "Record presentation of NEXUS AI student command center", "Final Project", Priority.MEDIUM, in2Days, 45);
        Task t5 = new Task("Study Data Structures", "Practice AVL Trees, Red-Black Trees, and Graph Traversals", "Data Structures", Priority.LOW, in3Days, 75);
        Task t6 = new Task("Work on frontend UI", "Refine Tailwind CSS v4 glassmorphism and animations", "UI Development", Priority.LOW, in4Days, 90);
        Task t7 = new Task("Implement database indexing", "Optimize query performance for high-volume logs", "PostgreSQL", Priority.MEDIUM, in5Days, 60);
        Task t8 = new Task("Review Operating Systems paging", "Read memory management and virtual memory chapters", "Operating Systems", Priority.LOW, in5Days, 50);
        Task t9 = new Task("Discrete Math problem set 4", "Solve graph coloring and recurrence relations", "Mathematics", Priority.MEDIUM, in7Days, 80);
        Task t10 = new Task("Configure Docker Compose stack", "Bundle Next.js, Spring Boot, and PostgreSQL containers", "DevOps", Priority.MEDIUM, in7Days, 40);
        Task t11 = new Task("Cloud deployment configuration", "Write Kubernetes manifests and GitHub Actions workflow", "Cloud Computing", Priority.LOW, in10Days, 60);
        Task t12 = new Task("Design system tokens audit", "Standardize cyan & violet color scales across all views", "UI Development", Priority.LOW, in10Days, 30);

        taskRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12));

        // 2 Completed tasks for authentic analytics & progress
        Task comp1 = new Task("Setup repository & Maven build", "Initialize Spring Boot 3.4 project with Java 25", "DevOps", Priority.HIGH, now.minus(2, ChronoUnit.DAYS), 45);
        comp1.setStatus(TaskStatus.COMPLETED);
        comp1.setCompletedAt(now.minus(2, ChronoUnit.DAYS));

        Task comp2 = new Task("Design database schema draft", "Entities for tasks, sessions, focus logs and MCP logs", "PostgreSQL", Priority.MEDIUM, now.minus(1, ChronoUnit.DAYS), 60);
        comp2.setStatus(TaskStatus.COMPLETED);
        comp2.setCompletedAt(now.minus(1, ChronoUnit.DAYS));

        taskRepository.saveAll(List.of(comp1, comp2));

        // 3. 7-Day Schedule matching mockup
        Instant baseTime = now.truncatedTo(ChronoUnit.DAYS);

        // Schedule blocks matching mockup days Thu-Wed
        createSession("Data Structures", "Data Structures", baseTime.minus(3, ChronoUnit.DAYS).plus(9, ChronoUnit.HOURS), 90);
        createSession("Project Meeting", "Final Project", baseTime.minus(3, ChronoUnit.DAYS).plus(14, ChronoUnit.HOURS), 60);
        createSession("Study Session", "Algorithms", baseTime.minus(3, ChronoUnit.DAYS).plus(19, ChronoUnit.HOURS), 90);

        createSession("Spring Boot", "Spring Boot", baseTime.minus(2, ChronoUnit.DAYS).plus(10, ChronoUnit.HOURS), 120);
        createSession("Lunch Break", "General", baseTime.minus(2, ChronoUnit.DAYS).plus(13, ChronoUnit.HOURS), 60);
        createSession("MCP Development", "Spring AI", baseTime.minus(2, ChronoUnit.DAYS).plus(16, ChronoUnit.HOURS), 120);

        createSession("Algorithms", "Algorithms", baseTime.minus(1, ChronoUnit.DAYS).plus(9, ChronoUnit.HOURS), 90);
        createSession("Mock Test", "Data Structures", baseTime.minus(1, ChronoUnit.DAYS).plus(11, ChronoUnit.HOURS), 120);
        createSession("Reading", "Computer Science", baseTime.minus(1, ChronoUnit.DAYS).plus(15, ChronoUnit.HOURS), 60);

        createSession("UI Development", "UI Development", baseTime.plus(10, ChronoUnit.HOURS), 120);
        createSession("Review & Practice", "Java 25", baseTime.plus(14, ChronoUnit.HOURS), 90);
        createSession("Free Time", "Personal", baseTime.plus(18, ChronoUnit.HOURS), 60);

        createSession("Final Project", "Final Project", baseTime.plus(1, ChronoUnit.DAYS).plus(9, ChronoUnit.HOURS), 150);
        createSession("Documentation", "Spring Boot", baseTime.plus(1, ChronoUnit.DAYS).plus(13, ChronoUnit.HOURS), 60);
        createSession("Exercise", "Wellness", baseTime.plus(1, ChronoUnit.DAYS).plus(17, ChronoUnit.HOURS), 60);

        createSession("Presentation Prep", "Final Project", baseTime.plus(2, ChronoUnit.DAYS).plus(10, ChronoUnit.HOURS), 90);
        createSession("Group Study", "Algorithms", baseTime.plus(2, ChronoUnit.DAYS).plus(15, ChronoUnit.HOURS), 120);
        createSession("Relax", "Wellness", baseTime.plus(2, ChronoUnit.DAYS).plus(19, ChronoUnit.HOURS), 60);

        createSession("Exam Practice", "Data Structures", baseTime.plus(3, ChronoUnit.DAYS).plus(9, ChronoUnit.HOURS), 120);
        createSession("Feedback Review", "Final Project", baseTime.plus(3, ChronoUnit.DAYS).plus(13, ChronoUnit.HOURS), 60);
        createSession("Weekly Plan", "Personal", baseTime.plus(3, ChronoUnit.DAYS).plus(18, ChronoUnit.HOURS), 60);

        // 4. Focus logs over the last 7 days totaling ~18 hours (1080 minutes)
        LocalDate todayDate = LocalDate.now();
        focusLogRepository.save(new FocusLog("Data Structures", 150, todayDate.minusDays(6), null, 0.92));
        focusLogRepository.save(new FocusLog("Spring Boot", 180, todayDate.minusDays(5), null, 0.95));
        focusLogRepository.save(new FocusLog("Algorithms", 140, todayDate.minusDays(4), null, 0.88));
        focusLogRepository.save(new FocusLog("Spring AI", 160, todayDate.minusDays(3), null, 0.94));
        focusLogRepository.save(new FocusLog("UI Development", 150, todayDate.minusDays(2), null, 0.90));
        focusLogRepository.save(new FocusLog("Java 25", 160, todayDate.minusDays(1), null, 0.96));
        focusLogRepository.save(new FocusLog("Final Project", 140, todayDate, null, 0.93));

        // 5. Initial MCP Tool Execution Logs
        mcpLogRepository.save(new McpToolExecutionLog(
                "listTasks",
                "session-init-01",
                "{\"status\":\"ALL\"}",
                "{\"count\":14,\"status\":\"SUCCESS\"}",
                "SUCCESS",
                18L,
                "Nexus-Overview-Dashboard"
        ));

        mcpLogRepository.save(new McpToolExecutionLog(
                "addTask",
                "session-init-02",
                "{\"title\":\"Build MCP server endpoints\",\"subject\":\"Spring Boot\",\"priority\":\"HIGH\"}",
                "{\"taskId\":2,\"status\":\"CREATED\"}",
                "SUCCESS",
                34L,
                "Nexus-AI-Assistant"
        ));

        mcpLogRepository.save(new McpToolExecutionLog(
                "generateStudyPlan",
                "session-init-03",
                "{\"subject\":\"Data Structures\",\"examDate\":\"2026-10-25\",\"dailyHoursAvailable\":3}",
                "{\"planSessionsCreated\":5,\"status\":\"GENERATED\"}",
                "SUCCESS",
                82L,
                "Nexus-Planner"
        ));
    }

    private void createSession(String title, String subject, Instant start, int minutes) {
        StudySession session = new StudySession(title, subject, start, start.plus(minutes, ChronoUnit.MINUTES), minutes, null);
        studySessionRepository.save(session);
    }
}
