package com.nexus.ai;

import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import com.nexus.ai.repository.FocusLogRepository;
import com.nexus.ai.repository.McpToolExecutionLogRepository;
import com.nexus.ai.repository.StudySessionRepository;
import com.nexus.ai.repository.SystemSettingsRepository;
import com.nexus.ai.repository.TaskRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
class NexusAiApplicationTests {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StudySessionRepository studySessionRepository;

    @Autowired
    private FocusLogRepository focusLogRepository;

    @Autowired
    private McpToolExecutionLogRepository mcpLogRepository;

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @Test
    @DisplayName("Context loads and seed data is initialized successfully")
    void contextLoadsAndSeedsData() {
        // Assert active tasks count
        long activeCount = taskRepository.countByStatusNot(TaskStatus.COMPLETED);
        assertThat(activeCount).isGreaterThanOrEqualTo(12);

        // Assert 7-day schedule sessions
        long sessionsCount = studySessionRepository.count();
        assertThat(sessionsCount).isGreaterThanOrEqualTo(20);

        // Assert focus logs exist
        long focusLogsCount = focusLogRepository.count();
        assertThat(focusLogsCount).isGreaterThanOrEqualTo(7);

        // Assert MCP logs exist
        long mcpLogsCount = mcpLogRepository.count();
        assertThat(mcpLogsCount).isGreaterThanOrEqualTo(3);

        // Assert system settings for Alex
        var settingsOpt = settingsRepository.findFirstByOrderByIdAsc();
        assertThat(settingsOpt).isPresent();
        assertThat(settingsOpt.get().getStudentName()).isEqualTo("Alex");
    }

    @Test
    @DisplayName("Task CRUD operations and query filters work correctly")
    void testTaskCrud() {
        Task task = new Task("Test Java 25 Virtual Threads", "Research concurrency improvements", "Java 25", Priority.HIGH, Instant.now().plus(2, ChronoUnit.DAYS), 45);
        Task saved = taskRepository.save(task);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(TaskStatus.PENDING);

        // Search test
        List<Task> searchResults = taskRepository.searchTasks(TaskStatus.PENDING, Priority.HIGH, "Java 25", "Virtual");
        assertThat(searchResults).isNotEmpty();

        // Status update
        saved.setStatus(TaskStatus.COMPLETED);
        Task updated = taskRepository.save(saved);
        assertThat(updated.getCompletedAt()).isNotNull();

        taskRepository.delete(updated);
        assertThat(taskRepository.findById(saved.getId())).isEmpty();
    }
}
