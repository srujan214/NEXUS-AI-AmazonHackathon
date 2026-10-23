package com.nexus.ai.dto;

import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class TaskDto {

    public record CreateRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            @NotBlank(message = "Subject is required") String subject,
            Priority priority,
            @NotNull(message = "Due date is required") Instant dueDate,
            Integer estimatedMinutes
    ) {}

    public record UpdateRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            @NotBlank(message = "Subject is required") String subject,
            Priority priority,
            TaskStatus status,
            @NotNull(message = "Due date is required") Instant dueDate,
            Integer estimatedMinutes
    ) {}

    public record Response(
            Long id,
            String title,
            String description,
            String subject,
            Priority priority,
            TaskStatus status,
            Instant dueDate,
            Integer estimatedMinutes,
            Instant completedAt,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static Response fromEntity(Task task) {
            return new Response(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getSubject(),
                    task.getPriority(),
                    task.getStatus(),
                    task.getDueDate(),
                    task.getEstimatedMinutes(),
                    task.getCompletedAt(),
                    task.getCreatedAt(),
                    task.getUpdatedAt()
            );
        }
    }
}
