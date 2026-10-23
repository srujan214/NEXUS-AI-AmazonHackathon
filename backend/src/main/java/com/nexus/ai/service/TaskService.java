package com.nexus.ai.service;

import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import com.nexus.ai.repository.TaskRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskDto.Response> getTasks(TaskStatus status, Priority priority, String subject, String query, String sortBy) {
        List<Task> tasks;
        if (query != null || status != null || priority != null || subject != null) {
            tasks = taskRepository.searchTasks(status, priority, subject, query);
        } else {
            Sort sort = "dueDate".equalsIgnoreCase(sortBy) ? Sort.by(Sort.Direction.ASC, "dueDate") :
                        "priority".equalsIgnoreCase(sortBy) ? Sort.by(Sort.Direction.ASC, "priority") :
                        Sort.by(Sort.Direction.DESC, "createdAt");
            tasks = taskRepository.findAll(sort);
        }
        return tasks.stream().map(TaskDto.Response::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public TaskDto.Response getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id));
        return TaskDto.Response.fromEntity(task);
    }

    @Transactional
    public TaskDto.Response createTask(TaskDto.CreateRequest request) {
        Task task = new Task(
                request.title(),
                request.description(),
                request.subject(),
                request.priority(),
                request.dueDate(),
                request.estimatedMinutes()
        );
        Task saved = taskRepository.save(task);
        return TaskDto.Response.fromEntity(saved);
    }

    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setSubject(request.subject());
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        task.setDueDate(request.dueDate());
        if (request.estimatedMinutes() != null) {
            task.setEstimatedMinutes(request.estimatedMinutes());
        }

        Task updated = taskRepository.save(task);
        return TaskDto.Response.fromEntity(updated);
    }

    @Transactional
    public TaskDto.Response toggleTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id));

        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.setStatus(TaskStatus.PENDING);
            task.setCompletedAt(null);
        } else {
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(Instant.now());
        }

        Task updated = taskRepository.save(task);
        return TaskDto.Response.fromEntity(updated);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }
}
