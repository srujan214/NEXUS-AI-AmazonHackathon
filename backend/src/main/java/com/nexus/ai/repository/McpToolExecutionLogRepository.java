package com.nexus.ai.repository;

import com.nexus.ai.model.McpToolExecutionLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface McpToolExecutionLogRepository extends JpaRepository<McpToolExecutionLog, Long> {

    List<McpToolExecutionLog> findAllByOrderByExecutedAtDesc(Pageable pageable);

    List<McpToolExecutionLog> findTop10ByOrderByExecutedAtDesc();

    List<McpToolExecutionLog> findByToolNameOrderByExecutedAtDesc(String toolName, Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT l.toolName, COUNT(l) FROM McpToolExecutionLog l GROUP BY l.toolName")
    List<Object[]> countExecutionsByTool();
}
