package com.nexus.ai.controller;

import com.nexus.ai.dto.AnalyticsDto;
import com.nexus.ai.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AnalyticsDto.FullAnalyticsResponse> getFullAnalytics() {
        return ResponseEntity.ok(analyticsService.getFullAnalytics());
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsDto.Overview> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<AnalyticsDto.ActivityPoint>> getActivityTrend() {
        return ResponseEntity.ok(analyticsService.getActivityTrend());
    }

    @GetMapping("/distribution")
    public ResponseEntity<List<AnalyticsDto.SubjectDistribution>> getSubjectDistribution() {
        return ResponseEntity.ok(analyticsService.getSubjectDistribution());
    }
}
