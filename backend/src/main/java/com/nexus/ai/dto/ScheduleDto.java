package com.nexus.ai.dto;

import com.nexus.ai.model.SessionStatus;
import com.nexus.ai.model.StudySession;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ScheduleDto {

    public record CreateRequest(
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Subject is required") String subject,
            @NotNull(message = "Start time is required") Instant startTime,
            @NotNull(message = "End time is required") Instant endTime,
            Integer durationMinutes,
            Long taskId,
            String notes
    ) {}

    public record UpdateRequest(
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Subject is required") String subject,
            @NotNull(message = "Start time is required") Instant startTime,
            @NotNull(message = "End time is required") Instant endTime,
            Integer durationMinutes,
            SessionStatus status,
            Long taskId,
            String notes
    ) {}

    public record Response(
            Long id,
            String title,
            String subject,
            Instant startTime,
            Instant endTime,
            Integer durationMinutes,
            SessionStatus status,
            Long taskId,
            String notes,
            Instant createdAt
    ) {
        public static Response fromEntity(StudySession session) {
            return new Response(
                    session.getId(),
                    session.getTitle(),
                    session.getSubject(),
                    session.getStartTime(),
                    session.getEndTime(),
                    session.getDurationMinutes(),
                    session.getStatus(),
                    session.getTaskId(),
                    session.getNotes(),
                    session.getCreatedAt()
            );
        }
    }
}
