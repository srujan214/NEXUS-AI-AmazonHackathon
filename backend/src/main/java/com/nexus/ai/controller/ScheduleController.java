package com.nexus.ai.controller;

import com.nexus.ai.dto.ScheduleDto;
import com.nexus.ai.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<ScheduleDto.Response>> getSchedule(
            @RequestParam(required = false) Instant start,
            @RequestParam(required = false) Instant end
    ) {
        return ResponseEntity.ok(scheduleService.getSchedule(start, end));
    }

    @PostMapping("/session")
    public ResponseEntity<ScheduleDto.Response> createSession(@Valid @RequestBody ScheduleDto.CreateRequest request) {
        ScheduleDto.Response created = scheduleService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/session/{id}")
    public ResponseEntity<ScheduleDto.Response> updateSession(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(scheduleService.updateSession(id, request));
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        scheduleService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
