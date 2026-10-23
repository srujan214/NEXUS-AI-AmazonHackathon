package com.nexus.ai.mcp;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

public class McpProtocol {

    public static final String PROTOCOL_VERSION = "2025-11-25";
    public static final String SERVER_NAME = "nexus-mcp-server";
    public static final String SERVER_VERSION = "1.0.0";

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record JsonRpcRequest(
            String jsonrpc,
            Object id,
            String method,
            Map<String, Object> params
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record JsonRpcResponse(
            String jsonrpc,
            Object id,
            Object result,
            JsonRpcError error
    ) {
        public static JsonRpcResponse success(Object id, Object result) {
            return new JsonRpcResponse("2.0", id, result, null);
        }

        public static JsonRpcResponse error(Object id, int code, String message) {
            return new JsonRpcResponse("2.0", id, null, new JsonRpcError(code, message, null));
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record JsonRpcError(
            int code,
            String message,
            Object data
    ) {}

    public record ServerCapabilities(
            Map<String, Object> tools,
            Map<String, Object> logging
    ) {}

    public record ServerInfo(
            String name,
            String version
    ) {}

    public record InitializeResult(
            String protocolVersion,
            ServerCapabilities capabilities,
            ServerInfo serverInfo
    ) {}

    public record ToolDefinition(
            String name,
            String description,
            Map<String, Object> inputSchema
    ) {}

    public record ToolsListResult(
            List<ToolDefinition> tools
    ) {}

    public record ToolContent(
            String type, // "text"
            String text
    ) {}

    public record CallToolResult(
            List<ToolContent> content,
            boolean isError
    ) {
        public static CallToolResult text(String text) {
            return new CallToolResult(List.of(new ToolContent("text", text)), false);
        }

        public static CallToolResult error(String error) {
            return new CallToolResult(List.of(new ToolContent("text", error)), true);
        }
    }
}
