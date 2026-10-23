package com.nexus.ai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "mcp_tool_execution_logs")
public class McpToolExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tool name is required")
    @Column(name = "tool_name", nullable = false, length = 100)
    private String toolName;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "arguments_json", columnDefinition = "TEXT")
    private String argumentsJson;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @NotBlank(message = "Status is required")
    @Column(nullable = false, length = 20)
    private String status; // SUCCESS or ERROR

    @NotNull
    @Column(name = "execution_duration_ms", nullable = false)
    private Long executionDurationMs;

    @Column(name = "client_info", length = 255)
    private String clientInfo;

    @Column(name = "executed_at", nullable = false, updatable = false)
    private Instant executedAt;

    public McpToolExecutionLog() {}

    public McpToolExecutionLog(String toolName, String sessionId, String argumentsJson, String resultJson, String status, Long executionDurationMs, String clientInfo) {
        this.toolName = toolName;
        this.sessionId = sessionId;
        this.argumentsJson = argumentsJson;
        this.resultJson = resultJson;
        this.status = status;
        this.executionDurationMs = executionDurationMs;
        this.clientInfo = clientInfo;
    }

    @PrePersist
    protected void onCreate() {
        this.executedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getArgumentsJson() {
        return argumentsJson;
    }

    public void setArgumentsJson(String argumentsJson) {
        this.argumentsJson = argumentsJson;
    }

    public String getResultJson() {
        return resultJson;
    }

    public void setResultJson(String resultJson) {
        this.resultJson = resultJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public String getClientInfo() {
        return clientInfo;
    }

    public void setClientInfo(String clientInfo) {
        this.clientInfo = clientInfo;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }
}
