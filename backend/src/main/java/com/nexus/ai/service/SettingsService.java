package com.nexus.ai.service;

import com.nexus.ai.dto.SettingsDto;
import com.nexus.ai.model.SystemSettings;
import com.nexus.ai.repository.SystemSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final SystemSettingsRepository settingsRepository;
    private final DataInitializer dataInitializer;

    public SettingsService(SystemSettingsRepository settingsRepository, DataInitializer dataInitializer) {
        this.settingsRepository = settingsRepository;
        this.dataInitializer = dataInitializer;
    }

    @Transactional(readOnly = true)
    public SettingsDto.Response getSettings() {
        SystemSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(new SystemSettings("Alex", "alex@nexus.edu", "Computer Science", 20)));
        return SettingsDto.Response.fromEntity(settings);
    }

    @Transactional
    public SettingsDto.Response updateSettings(SettingsDto.UpdateRequest request) {
        SystemSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(SystemSettings::new);

        settings.setStudentName(request.studentName());
        if (request.studentEmail() != null) {
            settings.setStudentEmail(request.studentEmail());
        }
        if (request.academicMajor() != null) {
            settings.setAcademicMajor(request.academicMajor());
        }
        if (request.weeklyFocusGoalHours() != null) {
            settings.setWeeklyFocusGoalHours(request.weeklyFocusGoalHours());
        }
        if (request.aiProvider() != null) {
            settings.setAiProvider(request.aiProvider());
        }
        if (request.aiModel() != null) {
            settings.setAiModel(request.aiModel());
        }
        if (request.apiKey() != null && !request.apiKey().isBlank()) {
            settings.setHasCustomApiKey(true);
            int len = request.apiKey().length();
            String masked = len > 8 ? request.apiKey().substring(0, 4) + "..." + request.apiKey().substring(len - 4) : "••••••••";
            settings.setApiKeyMasked(masked);
        }

        SystemSettings saved = settingsRepository.save(settings);
        return SettingsDto.Response.fromEntity(saved);
    }

    @Transactional
    public void resetAndReseedData() {
        dataInitializer.seedAll();
    }
}
