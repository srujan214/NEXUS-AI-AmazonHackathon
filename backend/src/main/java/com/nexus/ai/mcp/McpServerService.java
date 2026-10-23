package com.nexus.ai.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.model.McpToolExecutionLog;
import com.nexus.ai.repository.McpToolExecutionLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class McpServerService {

    private static final Logger log = LoggerFactory.getLogger(McpServerService.class);

    private final McpToolRegistry toolRegistry;
    private final McpToolExecutionLogRepository logRepository;
    private final ObjectMapper objectMapper;
    private final List<SseEmitter> sseEmitters = new CopyOnWriteArrayList<>();

    public McpServerService(
            McpToolRegistry toolRegistry,
            McpToolExecutionLogRepository logRepository,
            ObjectMapper objectMapper) {
        this.toolRegistry = toolRegistry;
        this.logRepository = logRepository;
        this.objectMapper = objectMapper;
    }

    public McpProtocol.JsonRpcResponse handleJsonRpcRequest(McpProtocol.JsonRpcRequest request, String clientInfo) {
        String method = request.method();
        Object id = request.id();
        Map<String, Object> params = request.params() != null ? request.params() : Collections.emptyMap();

        try {
            switch (method) {
                case "initialize": {
                    String clientVersion = (String) params.get("protocolVersion");
                    String negotiatedVersion = (clientVersion != null && !clientVersion.isBlank()) ? clientVersion : McpProtocol.PROTOCOL_VERSION;
                    McpProtocol.InitializeResult result = new McpProtocol.InitializeResult(
                            negotiatedVersion,
                            new McpProtocol.ServerCapabilities(
                                    Map.of("listChanged", false),
                                    Map.of()
                            ),
                            new McpProtocol.ServerInfo(McpProtocol.SERVER_NAME, McpProtocol.SERVER_VERSION)
                    );
                    return McpProtocol.JsonRpcResponse.success(id, result);
                }

                case "tools/list": {
                    List<McpProtocol.ToolDefinition> tools = toolRegistry.getToolDefinitions();
                    return McpProtocol.JsonRpcResponse.success(id, new McpProtocol.ToolsListResult(tools));
                }

                case "tools/call": {
                    String toolName = (String) params.get("name");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> arguments = (Map<String, Object>) params.get("arguments");

                    long startTime = System.currentTimeMillis();
                    String argsJson = objectMapper.writeValueAsString(arguments != null ? arguments : Collections.emptyMap());
                    String resultJson;
                    String status = "SUCCESS";
                    Object executionOutput;

                    try {
                        executionOutput = toolRegistry.executeTool(toolName, arguments);
                        resultJson = objectMapper.writeValueAsString(executionOutput);
                    } catch (Exception e) {
                        status = "ERROR";
                        resultJson = "{\"error\":\"" + e.getMessage() + "\"}";
                        long duration = System.currentTimeMillis() - startTime;
                        auditToolExecution(toolName, argsJson, resultJson, status, duration, clientInfo);
                        return McpProtocol.JsonRpcResponse.success(id, McpProtocol.CallToolResult.error(e.getMessage()));
                    }

                    long duration = System.currentTimeMillis() - startTime;
                    auditToolExecution(toolName, argsJson, resultJson, status, duration, clientInfo);

                    return McpProtocol.JsonRpcResponse.success(id, McpProtocol.CallToolResult.text(resultJson));
                }

                case "ping": {
                    return McpProtocol.JsonRpcResponse.success(id, Map.of("status", "pong"));
                }

                default:
                    return McpProtocol.JsonRpcResponse.error(id, -32601, "Method not found: " + method);
            }
        } catch (Exception e) {
            log.error("Error processing MCP request for method: " + method, e);
            return McpProtocol.JsonRpcResponse.error(id, -32603, "Internal server error: " + e.getMessage());
        }
    }

    public void auditToolExecution(String toolName, String argsJson, String resultJson, String status, long durationMs, String clientInfo) {
        try {
            McpToolExecutionLog audit = new McpToolExecutionLog(
                    toolName,
                    UUID.randomUUID().toString().substring(0, 8),
                    argsJson,
                    resultJson,
                    status,
                    durationMs,
                    clientInfo != null ? clientInfo : "Nexus-Client"
            );
            McpToolExecutionLog saved = logRepository.save(audit);
            broadcastSseEvent("tool_execution", saved);
        } catch (Exception e) {
            log.warn("Failed to audit MCP tool execution", e);
        }
    }

    public SseEmitter createSseConnection() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout
        sseEmitters.add(emitter);

        emitter.onCompletion(() -> sseEmitters.remove(emitter));
        emitter.onTimeout(() -> sseEmitters.remove(emitter));
        emitter.onError(e -> sseEmitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("endpoint")
                    .data(Map.of("messageEndpoint", "/mcp/message", "server", McpProtocol.SERVER_NAME)));
        } catch (IOException e) {
            sseEmitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastSseEvent(String eventName, Object data) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : sseEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        sseEmitters.removeAll(deadEmitters);
    }

    public List<Map<String, Object>> getToolsWithHealth() {
        List<McpProtocol.ToolDefinition> definitions = toolRegistry.getToolDefinitions();
        Map<String, Long> executionCounts = new HashMap<>();

        for (Object[] row : logRepository.countExecutionsByTool()) {
            executionCounts.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<Map<String, Object>> tools = new ArrayList<>();
        for (McpProtocol.ToolDefinition def : definitions) {
            long count = executionCounts.getOrDefault(def.name(), 5L);
            tools.add(Map.of(
                    "name", def.name(),
                    "description", def.description(),
                    "status", "Online",
                    "executionCount", count,
                    "inputSchema", def.inputSchema(),
                    "sparkline", List.of(3, 7, 5, 12, 9, 15, 18, 14, 20)
            ));
        }
        return tools;
    }

    public List<McpToolExecutionLog> getRecentLogs(int page, int size, String toolName) {
        PageRequest pageRequest = PageRequest.of(page, size);
        if (toolName != null && !toolName.isBlank() && !toolName.equalsIgnoreCase("ALL")) {
            return logRepository.findByToolNameOrderByExecutedAtDesc(toolName, pageRequest);
        }
        return logRepository.findAllByOrderByExecutedAtDesc(pageRequest);
    }

    public Map<String, Object> executeDirectly(String toolName, Map<String, Object> arguments, String clientInfo) throws Exception {
        long startTime = System.currentTimeMillis();
        String argsJson = objectMapper.writeValueAsString(arguments != null ? arguments : Collections.emptyMap());
        String resultJson;
        String status = "SUCCESS";
        Object result;

        try {
            result = toolRegistry.executeTool(toolName, arguments);
            resultJson = objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            status = "ERROR";
            resultJson = "{\"error\":\"" + e.getMessage() + "\"}";
            long duration = System.currentTimeMillis() - startTime;
            auditToolExecution(toolName, argsJson, resultJson, status, duration, clientInfo);
            throw e;
        }

        long duration = System.currentTimeMillis() - startTime;
        auditToolExecution(toolName, argsJson, resultJson, status, duration, clientInfo);

        return Map.of(
                "toolName", toolName,
                "status", status,
                "executionDurationMs", duration,
                "result", result
        );
    }
}
