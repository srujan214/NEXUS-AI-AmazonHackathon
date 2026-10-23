package com.nexus.ai.controller;

import com.nexus.ai.dto.MissionDto;
import com.nexus.ai.service.MissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @GetMapping
    public ResponseEntity<List<MissionDto.Response>> getAllMissions() {
        return ResponseEntity.ok(missionService.getAllMissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionDto.Response> getMissionById(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getMissionById(id));
    }

    @PostMapping("/plan")
    public ResponseEntity<MissionDto.Response> planMission(@Valid @RequestBody MissionDto.CreateRequest request) {
        MissionDto.Response response = missionService.createAndPlanMission(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<MissionDto.Response> approveMission(@PathVariable Long id) {
        MissionDto.Response response = missionService.approveAndExecuteMission(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<MissionDto.Response> cancelMission(@PathVariable Long id) {
        MissionDto.Response response = missionService.cancelMission(id);
        return ResponseEntity.ok(response);
    }
}
