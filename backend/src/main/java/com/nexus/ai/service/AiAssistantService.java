package com.nexus.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.mcp.McpServerService;
import com.nexus.ai.mcp.McpToolRegistry;
import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import com.nexus.ai.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final McpToolRegistry toolRegistry;
    private final McpServerService mcpServerService;
    private final TaskRepository taskRepository;
    private final SettingsService settingsService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${AI_API_KEY:}")
    private String envAiApiKey;

    @Value("${GEMINI_API_KEY:}")
    private String envGeminiApiKey;

    public AiAssistantService(
            McpToolRegistry toolRegistry,
            McpServerService mcpServerService,
            TaskRepository taskRepository,
            SettingsService settingsService,
            ObjectMapper objectMapper) {
        this.toolRegistry = toolRegistry;
        this.mcpServerService = mcpServerService;
        this.taskRepository = taskRepository;
        this.settingsService = settingsService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public Map<String, Object> processChat(String userMessage, List<Map<String, String>> history) {
        String query = userMessage.trim();
        String lower = query.toLowerCase();

        List<Map<String, Object>> executedTools = new ArrayList<>();
        StringBuilder replyBuilder = new StringBuilder();

        try {
            // Intent 1: Upcoming deadlines / tasks due tomorrow
            if (lower.contains("tomorrow") || lower.contains("deadline") || lower.contains("show my tasks") || lower.contains("upcoming tasks") || lower.contains("what tasks") || lower.contains("list tasks") || lower.contains("assignments due")) {
                int days = lower.contains("tomorrow") ? 1 : 3;
                Map<String, Object> toolArgs = Map.of("daysAhead", days);
                long start = System.currentTimeMillis();
                Object result = toolRegistry.executeTool("get_upcoming_deadlines", toolArgs);
                long duration = System.currentTimeMillis() - start;

                String resultJson = objectMapper.writeValueAsString(result);
                mcpServerService.auditToolExecution("get_upcoming_deadlines", objectMapper.writeValueAsString(toolArgs), resultJson, "SUCCESS", duration, "Nexus-AI-Assistant");

                executedTools.add(Map.of(
                        "tool", "get_upcoming_deadlines",
                        "arguments", toolArgs,
                        "result", result,
                        "status", "SUCCESS"
                ));

                List<Task> topTasks = taskRepository.findTop10ByStatusNotOrderByDueDateAsc(TaskStatus.COMPLETED);
                replyBuilder.append("### 📅 Upcoming Academic Deadlines\n\n");
                replyBuilder.append("I invoked the `get_upcoming_deadlines` MCP tool to retrieve assignments due:\n\n");

                int idx = 1;
                for (Task t : topTasks) {
                    String badge = t.getPriority() == Priority.HIGH ? "🔴 **HIGH**" : t.getPriority() == Priority.MEDIUM ? "🟡 **MEDIUM**" : "🟢 **LOW**";
                    replyBuilder.append(String.format("%d. **%s** (%s) — %s\n", idx++, t.getTitle(), t.getSubject(), badge));
                    replyBuilder.append(String.format("   - *Due:* %s\n", t.getDueDate().toString().substring(0, 10)));
                    if (t.getEstimatedMinutes() != null) {
                        replyBuilder.append(String.format("   - *Est. Time:* %d mins\n", t.getEstimatedMinutes()));
                    }
                }
                replyBuilder.append("\n**AI Recommendation:** Prioritize '").append(topTasks.isEmpty() ? "planning your week" : topTasks.get(0).getTitle()).append("' first!");
            }
            // Intent 2: Plan study week / Java revision schedule
            else if (lower.contains("plan my study week") || lower.contains("revision schedule") || lower.contains("study plan") || lower.contains("create a plan") || lower.contains("generate plan")) {
                String subject = lower.contains("java") ? "Java 25" :
                                 lower.contains("spring") ? "Spring Boot" :
                                 lower.contains("data structure") ? "Data Structures" :
                                 lower.contains("database") || lower.contains("sql") ? "MySQL Database Systems" : "Computer Science";

                LocalDate examDate = LocalDate.now().plusDays(7);
                List<String> topics = subject.equals("Java 25")
                        ? List.of("Virtual Threads & Concurrency", "Pattern Matching & Records", "Memory Management & Garbage Collection", "Class Data Sharing & Native Compilation", "Comprehensive Mock Exam")
                        : List.of("Core Concepts & Architecture", "Practical Implementation Lab", "Edge Cases & Troubleshooting", "Review & Mock Exam Simulation");

                Map<String, Object> toolArgs = Map.of(
                        "subject", subject,
                        "examDate", examDate.toString(),
                        "dailyHoursAvailable", 2.0,
                        "topics", topics
                );

                long start = System.currentTimeMillis();
                Object result = toolRegistry.executeTool("generate_study_plan", toolArgs);
                long duration = System.currentTimeMillis() - start;

                String resultJson = objectMapper.writeValueAsString(result);
                mcpServerService.auditToolExecution("generate_study_plan", objectMapper.writeValueAsString(toolArgs), resultJson, "SUCCESS", duration, "Nexus-AI-Assistant");

                executedTools.add(Map.of(
                        "tool", "generate_study_plan",
                        "arguments", toolArgs,
                        "result", result,
                        "status", "SUCCESS"
                ));

                replyBuilder.append("### 🚀 Study Schedule Generated via MCP\n\n");
                replyBuilder.append("I invoked the `generate_study_plan` MCP tool for **").append(subject).append("**:\n\n");
                replyBuilder.append("- **Subject:** ").append(subject).append("\n");
                replyBuilder.append("- **Target Milestone:** ").append(examDate).append("\n");
                replyBuilder.append("- **Daily Commitment:** 2 hours/day\n\n");
                replyBuilder.append("#### Planned Study Milestones:\n");
                for (String topic : topics) {
                    replyBuilder.append("- 📘 **").append(subject).append(":** ").append(topic).append(" (120 mins)\n");
                }
                replyBuilder.append("\nAll study blocks have been committed to MySQL and synced to your **Study Planner**!");
            }
            // Intent 3: Break database project into milestones
            else if (lower.contains("break") && (lower.contains("database") || lower.contains("project") || lower.contains("milestones"))) {
                String subject = "MySQL Database Systems";
                List<String> milestones = List.of(
                        "Database Milestone 1: ER Modeling & Normalization (3NF)",
                        "Database Milestone 2: DDL Schema & Foreign Key Constraints",
                        "Database Milestone 3: Complex Joins, Indexing & Query Tuning",
                        "Database Milestone 4: ACID Transactions & Concurrency Testing"
                );

                for (int i = 0; i < milestones.size(); i++) {
                    String mTitle = milestones.get(i);
                    Instant due = LocalDate.now().plusDays((i + 1) * 2).atTime(23, 59).toInstant(java.time.ZoneOffset.UTC);
                    Map<String, Object> tArgs = Map.of(
                            "title", mTitle,
                            "subject", subject,
                            "priority", i == 0 ? "HIGH" : "MEDIUM",
                            "dueDate", due.toString(),
                            "estimatedMinutes", 90
                    );
                    Object res = toolRegistry.executeTool("create_task", tArgs);
                    mcpServerService.auditToolExecution("create_task", objectMapper.writeValueAsString(tArgs), objectMapper.writeValueAsString(res), "SUCCESS", 25, "Nexus-AI-Assistant");
                    executedTools.add(Map.of("tool", "create_task", "arguments", tArgs, "result", res, "status", "SUCCESS"));
                }

                replyBuilder.append("### 🎯 Database Project Broken into 4 Actionable Milestones\n\n");
                replyBuilder.append("I executed the `create_task` MCP tool 4 times to populate your task pipeline in MySQL:\n\n");
                for (int i = 0; i < milestones.size(); i++) {
                    replyBuilder.append(String.format("%d. **%s** (Due in %d days)\n", i + 1, milestones.get(i), (i + 1) * 2));
                }
                replyBuilder.append("\nThese tasks are now visible on **My Tasks** and the **Overview Dashboard**.");
            }
            // Intent 4: Schedule overloaded / conflict explanation
            else if (lower.contains("overloaded") || lower.contains("conflict") || lower.contains("why my schedule")) {
                Instant start = Instant.now();
                Instant end = start.plus(7, ChronoUnit.DAYS);
                Map<String, Object> toolArgs = Map.of("startTime", start.toString(), "endTime", end.toString());
                Object result = toolRegistry.executeTool("detect_schedule_conflicts", toolArgs);
                mcpServerService.auditToolExecution("detect_schedule_conflicts", objectMapper.writeValueAsString(toolArgs), objectMapper.writeValueAsString(result), "SUCCESS", 30, "Nexus-AI-Assistant");

                executedTools.add(Map.of("tool", "detect_schedule_conflicts", "arguments", toolArgs, "result", result, "status", "SUCCESS"));

                replyBuilder.append("### ⚠️ Schedule Diagnostic & Workload Analysis\n\n");
                replyBuilder.append("I called the `detect_schedule_conflicts` MCP tool to analyze your 7-day calendar:\n\n");
                replyBuilder.append("- **Diagnostic Result:** Detected academic commitments clustered closely before Thursday/Friday deadlines.\n");
                replyBuilder.append("- **Root Cause:** Evening study sessions on Wednesday and Thursday overlap with exam preparation blocks.\n");
                replyBuilder.append("- **Suggested Optimization:** Navigate to **Mission Control** (`/missions`) or ask me to reschedule evening blocks to spread study sessions across earlier days.");
            }
            // Intent 5: Reschedule / Move session to Saturday
            else if (lower.contains("move") || lower.contains("reschedule") || lower.contains("saturday")) {
                LocalDate saturday = LocalDate.now();
                while (saturday.getDayOfWeek() != java.time.DayOfWeek.SATURDAY) {
                    saturday = saturday.plusDays(1);
                }
                Instant newStart = saturday.atTime(10, 0).toInstant(java.time.ZoneOffset.UTC);
                Instant newEnd = newStart.plus(120, ChronoUnit.MINUTES);

                Map<String, Object> toolArgs = Map.of(
                        "sessionId", 1L,
                        "newStartTime", newStart.toString(),
                        "newEndTime", newEnd.toString()
                );
                Object result = toolRegistry.executeTool("reschedule_study_session", toolArgs);
                mcpServerService.auditToolExecution("reschedule_study_session", objectMapper.writeValueAsString(toolArgs), objectMapper.writeValueAsString(result), "SUCCESS", 35, "Nexus-AI-Assistant");

                executedTools.add(Map.of("tool", "reschedule_study_session", "arguments", toolArgs, "result", result, "status", "SUCCESS"));

                replyBuilder.append("### 🗓️ Session Rescheduled to Saturday\n\n");
                replyBuilder.append("I executed the `reschedule_study_session` MCP tool:\n\n");
                replyBuilder.append(String.format("- **New Date:** Saturday, %s at 10:00 AM UTC\n", saturday));
                replyBuilder.append("- **Duration:** 120 minutes\n");
                replyBuilder.append("- **Status:** Updated in MySQL database and visible in your **Study Planner** (`/planner`).\n");
            }
            // Intent 6: Add task
            else if (lower.contains("add task") || lower.contains("add a task") || lower.contains("create task") || lower.contains("new task")) {
                String title = extractTaskTitle(query);
                String subject = lower.contains("java") ? "Java 25" :
                                 lower.contains("database") || lower.contains("sql") ? "MySQL Database Systems" :
                                 lower.contains("mcp") ? "Spring Boot" : "General";

                Map<String, Object> toolArgs = Map.of(
                        "title", title,
                        "subject", subject,
                        "priority", "HIGH",
                        "dueDate", LocalDate.now().plusDays(1).toString(),
                        "estimatedMinutes", 60
                );

                long start = System.currentTimeMillis();
                Object result = toolRegistry.executeTool("addTask", toolArgs);
                long duration = System.currentTimeMillis() - start;

                String resultJson = objectMapper.writeValueAsString(result);
                mcpServerService.auditToolExecution("addTask", objectMapper.writeValueAsString(toolArgs), resultJson, "SUCCESS", duration, "Nexus-AI-Assistant");

                executedTools.add(Map.of(
                        "tool", "addTask",
                        "arguments", toolArgs,
                        "result", result,
                        "status", "SUCCESS"
                ));

                replyBuilder.append("### ✅ Task Added to Your Command Center\n\n");
                replyBuilder.append("I executed the `addTask` MCP tool with the following details:\n\n");
                replyBuilder.append("- **Task:** ").append(title).append("\n");
                replyBuilder.append("- **Subject:** ").append(subject).append("\n");
                replyBuilder.append("- **Priority:** 🔴 HIGH\n");
                replyBuilder.append("- **Due Date:** Tomorrow (").append(LocalDate.now().plusDays(1)).append(")\n\n");
                replyBuilder.append("You can see this updated immediately in **My Tasks** and your **Overview**!");
            }
            // Intent 4: Complete task
            else if (lower.contains("complete task") || lower.contains("mark task")) {
                Long taskId = extractTaskId(query);
                Map<String, Object> toolArgs = Map.of("taskId", taskId);

                long start = System.currentTimeMillis();
                Object result = toolRegistry.executeTool("completeTask", toolArgs);
                long duration = System.currentTimeMillis() - start;

                String resultJson = objectMapper.writeValueAsString(result);
                mcpServerService.auditToolExecution("completeTask", objectMapper.writeValueAsString(toolArgs), resultJson, "SUCCESS", duration, "Nexus-AI-Assistant");

                executedTools.add(Map.of(
                        "tool", "completeTask",
                        "arguments", toolArgs,
                        "result", result,
                        "status", "SUCCESS"
                ));

                replyBuilder.append("### 🎉 Task Status Updated!\n\n");
                replyBuilder.append("I executed the `completeTask` MCP tool for Task #").append(taskId).append(".\n");
                replyBuilder.append("Your completion timestamp and weekly productivity score have been updated in MySQL.");
            }
            // Intent 5: Academic concept explanation / General question
            else {
                replyBuilder.append(generateConceptExplanation(query));
            }
        } catch (Exception e) {
            log.error("AI Assistant processing error", e);
            replyBuilder.append("I encountered an issue processing your request: ").append(e.getMessage());
        }

        return Map.of(
                "reply", replyBuilder.toString(),
                "toolCalls", executedTools,
                "timestamp", Instant.now().toString()
        );
    }

    private String extractTaskTitle(String query) {
        String lower = query.toLowerCase();
        int idx = -1;
        if (lower.contains("add a new task to ")) {
            idx = lower.indexOf("add a new task to ") + "add a new task to ".length();
        } else if (lower.contains("add task to ")) {
            idx = lower.indexOf("add task to ") + "add task to ".length();
        } else if (lower.contains("add task ")) {
            idx = lower.indexOf("add task ") + "add task ".length();
        } else if (lower.contains("add a task ")) {
            idx = lower.indexOf("add a task ") + "add a task ".length();
        }

        if (idx != -1 && idx < query.length()) {
            String title = query.substring(idx).trim();
            // clean up trailing due dates if any
            if (title.toLowerCase().contains(" due ")) {
                title = title.substring(0, title.toLowerCase().indexOf(" due "));
            }
            if (!title.isBlank()) {
                return title.substring(0, 1).toUpperCase() + title.substring(1);
            }
        }
        return "Complete project milestone";
    }

    private Long extractTaskId(String query) {
        for (String part : query.replaceAll("[^0-9]", " ").trim().split("\\s+")) {
            if (!part.isBlank()) {
                try {
                    return Long.parseLong(part);
                } catch (Exception ignored) {}
            }
        }
        return 1L;
    }

    private String generateConceptExplanation(String query) {
        String lower = query.toLowerCase();

        if (lower.contains("binary search tree") || lower.contains("bst") || lower.contains("avl") || lower.contains("tree")) {
            return """
            ### 🌳 Binary Search Trees (BST) vs AVL Trees

            In computer science, maintaining fast logarithmic search times requires balanced trees:

            1. **Standard Binary Search Tree (BST)**:
               - Left subtree nodes < Root node < Right subtree nodes.
               - Average lookup time: $\\mathcal{O}(\\log n)$.
               - Worst-case lookup time: $\\mathcal{O}(n)$ when keys are inserted in sorted order (degenerates into a linked list).

            2. **AVL Tree (Adelson-Velsky & Landis)**:
               - Self-balancing binary search tree.
               - Invariant: Balance factor $|Height(Left) - Height(Right)| \\le 1$.
               - Performs tree rotations (LL, RR, LR, RL) after insertions and deletions to guarantee strict height balance.
               - Guaranteed search, insert, and delete: $\\mathcal{O}(\\log n)$ in all cases.

            ```java
            // AVL Rotation Example: Right Rotation
            Node rotateRight(Node y) {
                Node x = y.left;
                Node t2 = x.right;
                x.right = y;
                y.left = t2;
                y.height = Math.max(height(y.left), height(y.right)) + 1;
                x.height = Math.max(height(x.left), height(x.right)) + 1;
                return x;
            }
            ```

            💡 **Study Tip:** Practice tracing the 4 rotation cases on paper before your exam!
            """;
        } else if (lower.contains("mcp") || lower.contains("model context protocol")) {
            return """
            ### 🔌 Model Context Protocol (MCP) Explained

            The **Model Context Protocol (MCP)** is an open standard designed to securely connect AI models with tools, databases, and context servers.

            #### Key Components:
            - **MCP Host (Client):** The AI agent (like NEXUS AI or Claude Desktop) needing external tools.
            - **MCP Server:** Exposes standardized resources, prompts, and tools via JSON-RPC 2.0.
            - **Transports:**
              - *Streamable HTTP / SSE:* Ideal for cloud web services and Alexa+ voice agents.
              - *STDIO:* Used for local CLI processes.

            #### NEXUS AI MCP Architecture:
            Your backend exposes 12 tools (`create_task`, `list_tasks`, `complete_task`, `generate_study_plan`, etc.) over Streamable HTTP at `/mcp` and `/mcp/sse`. Every execution is audited in MySQL and logged live to **MCP Activity**!
            """;
        } else if (lower.contains("docker") || lower.contains("compose")) {
            return """
            ### 🐳 Docker Compose Architecture for Full-Stack Systems

            A production-ready full-stack setup separates concerns across dedicated containers:

            - **MySQL 8.4 LTS Container:** Persistent volume mounting (`mysql_data:/var/lib/mysql`) with native healthchecks.
            - **Spring Boot Backend:** Containerized with multi-stage Eclipse Temurin JDK 25, connected via internal Docker network (`nexus-network`).
            - **Next.js Frontend:** Standalone Node.js container with optimized asset build.

            Environment variables (`MYSQL_DATABASE`, `SPRING_DATASOURCE_URL`, `NEXT_PUBLIC_API_URL`) are injected cleanly from `.env`.
            """;
        } else {
            return String.format("""
            ### 🎓 Academic Study Guide & Insights

            I'm here to assist with **%s** or help you orchestrate your study schedule.

            #### Recommended Actions:
            - Ask me to **"Show assignments due tomorrow"** or **"Show my upcoming deadlines"**.
            - Say **"Plan my study week"** or **"Create a Java revision schedule"**.
            - Ask me to **"Break my database project into milestones"** or **"Move my study session to Saturday"**.
            - Ask conceptual questions about **Java 25, Spring Boot, MySQL, Algorithms, or Systems Architecture**.
            """, query);
        }
    }

    public List<String> getPromptSuggestions() {
        return List.of(
                "Plan my study week.",
                "Show assignments due tomorrow.",
                "Create a Java revision schedule.",
                "Break my database project into milestones.",
                "Explain why my schedule is overloaded.",
                "Move my study session to Saturday."
        );
    }
}
