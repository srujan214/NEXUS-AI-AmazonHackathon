package com.nexus.ai.controller;

import com.nexus.ai.mcp.McpProtocol;
import com.nexus.ai.mcp.McpServerService;
import com.nexus.ai.model.McpToolExecutionLog;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
public class McpController {

    private final McpServerService mcpServerService;

    public McpController(McpServerService mcpServerService) {
        this.mcpServerService = mcpServerService;
    }

    /**
     * Standard Streamable HTTP Model Context Protocol (MCP) endpoint.
     */
    @PostMapping(value = "/mcp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<McpProtocol.JsonRpcResponse> handleMcp(
            @RequestBody McpProtocol.JsonRpcRequest request,
            @RequestHeader(value = "User-Agent", defaultValue = "mcp-client") String userAgent
    ) {
        McpProtocol.JsonRpcResponse response = mcpServerService.handleJsonRpcRequest(request, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Server-Sent Events (SSE) MCP transport.
     */
    @GetMapping(value = "/mcp/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connectSse() {
        return mcpServerService.createSseConnection();
    }

    /**
     * Client-to-server message dispatch for SSE transport.
     */
    @PostMapping(value = "/mcp/message", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<McpProtocol.JsonRpcResponse> postSseMessage(
            @RequestBody McpProtocol.JsonRpcRequest request,
            @RequestHeader(value = "User-Agent", defaultValue = "mcp-sse-client") String userAgent
    ) {
        McpProtocol.JsonRpcResponse response = mcpServerService.handleJsonRpcRequest(request, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * REST API for Frontend Overview and MCP Activity widgets.
     */
    @GetMapping("/api/mcp/tools")
    public ResponseEntity<List<Map<String, Object>>> getTools() {
        return ResponseEntity.ok(mcpServerService.getToolsWithHealth());
    }

    @GetMapping("/api/mcp/logs")
    public ResponseEntity<List<McpToolExecutionLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String tool
    ) {
        return ResponseEntity.ok(mcpServerService.getRecentLogs(page, size, tool));
    }

    @PostMapping("/api/mcp/execute")
    public ResponseEntity<Map<String, Object>> executeDirect(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "User-Agent", defaultValue = "nexus-web-console") String userAgent
    ) throws Exception {
        String tool = (String) body.get("tool");
        @SuppressWarnings("unchecked")
        Map<String, Object> arguments = (Map<String, Object>) body.get("arguments");
        return ResponseEntity.ok(mcpServerService.executeDirectly(tool, arguments, userAgent));
    }
}
