package com.nexus.ai.dto;

import com.nexus.ai.model.Mission;
import com.nexus.ai.model.MissionStatus;
import com.nexus.ai.model.MissionStep;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

public class MissionDto {

    public record CreateRequest(
            @NotBlank(message = "Goal is required") String goal,
            Double dailyHoursAvailable,
            Instant targetDate
    ) {}

    public record StepResponse(
            Long id,
            String stepName,
            String status,
            String details,
            Instant createdAt
    ) {
        public static StepResponse fromEntity(MissionStep step) {
            return new StepResponse(
                    step.getId(),
                    step.getStepName(),
                    step.getStatus(),
                    step.getDetails(),
                    step.getCreatedAt()
            );
        }
    }

    public record Response(
            Long id,
            String goal,
            MissionStatus status,
            Instant targetDate,
            Double dailyHoursAvailable,
            Integer conflictsDetected,
            String conflictDetails,
            String proposedPlanJson,
            String executionSummaryJson,
            List<StepResponse> steps,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static Response fromEntity(Mission m) {
            return new Response(
                    m.getId(),
                    m.getGoal(),
                    m.getStatus(),
                    m.getTargetDate(),
                    m.getDailyHoursAvailable(),
                    m.getConflictsDetected(),
                    m.getConflictDetails(),
                    m.getProposedPlanJson(),
                    m.getExecutionSummaryJson(),
                    m.getSteps() != null ? m.getSteps().stream().map(StepResponse::fromEntity).toList() : List.of(),
                    m.getCreatedAt(),
                    m.getUpdatedAt()
            );
        }
    }
}
