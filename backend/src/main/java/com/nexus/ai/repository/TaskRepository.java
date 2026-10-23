package com.nexus.ai.repository;

import com.nexus.ai.model.Priority;
import com.nexus.ai.model.Task;
import com.nexus.ai.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByStatusNot(TaskStatus status);

    List<Task> findByStatusNotOrderByDueDateAsc(TaskStatus status);

    List<Task> findTop10ByStatusNotOrderByDueDateAsc(TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByStatusNot(TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status != 'COMPLETED' AND t.dueDate <= :deadlineThreshold")
    long countUpcomingDeadlines(@Param("deadlineThreshold") Instant deadlineThreshold);

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:subject IS NULL OR LOWER(t.subject) = LOWER(:subject)) AND " +
           "(:query IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY t.dueDate ASC")
    List<Task> searchTasks(
            @Param("status") TaskStatus status,
            @Param("priority") Priority priority,
            @Param("subject") String subject,
            @Param("query") String query
    );
}
