package com.nexus.ai.controller;

import com.nexus.ai.dto.SettingsDto;
import com.nexus.ai.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/settings")
    public ResponseEntity<SettingsDto.Response> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SettingsDto.Response> updateSettings(@Valid @RequestBody SettingsDto.UpdateRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(request));
    }

    @PostMapping("/system/seed")
    public ResponseEntity<Map<String, String>> resetAndSeed() {
        settingsService.resetAndReseedData();
        return ResponseEntity.ok(Map.of("message", "Database successfully re-seeded with Alex's sample dataset", "status", "SUCCESS"));
    }
}
