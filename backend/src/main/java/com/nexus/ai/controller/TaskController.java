package com.nexus.ai.controller;

import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.model.Priority;
import com.nexus.ai.model.TaskStatus;
import com.nexus.ai.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDto.Response>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "dueDate") String sortBy
    ) {
        List<TaskDto.Response> tasks = taskService.getTasks(status, priority, subject, query, sortBy);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.Response> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.CreateRequest request) {
        TaskDto.Response created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskDto.Response> toggleTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
