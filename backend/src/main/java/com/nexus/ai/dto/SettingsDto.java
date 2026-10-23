package com.nexus.ai.dto;

import com.nexus.ai.model.SystemSettings;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class SettingsDto {

    public record UpdateRequest(
            @NotBlank(message = "Student name is required") String studentName,
            String studentEmail,
            String academicMajor,
            @NotNull Integer weeklyFocusGoalHours,
            String aiProvider,
            String aiModel,
            String apiKey
    ) {}

    public record Response(
            Long id,
            String studentName,
            String studentEmail,
            String academicMajor,
            Integer weeklyFocusGoalHours,
            String aiProvider,
            String aiModel,
            Boolean hasCustomApiKey,
            String apiKeyMasked,
            Instant updatedAt
    ) {
        public static Response fromEntity(SystemSettings s) {
            return new Response(
                    s.getId(),
                    s.getStudentName(),
                    s.getStudentEmail(),
                    s.getAcademicMajor(),
                    s.getWeeklyFocusGoalHours(),
                    s.getAiProvider(),
                    s.getAiModel(),
                    s.getHasCustomApiKey(),
                    s.getApiKeyMasked(),
                    s.getUpdatedAt()
            );
        }
    }
}
