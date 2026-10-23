package com.nexus.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.mcp.McpProtocol;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class McpAndAiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("MCP POST /mcp initialize handshake returns capabilities with 2025-11-25")
    void testMcpInitialize() throws Exception {
        McpProtocol.JsonRpcRequest request = new McpProtocol.JsonRpcRequest(
                "2.0",
                1,
                "initialize",
                Map.of("protocolVersion", "2025-11-25")
        );

        mockMvc.perform(post("/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jsonrpc").value("2.0"))
                .andExpect(jsonPath("$.result.protocolVersion").value("2025-11-25"))
                .andExpect(jsonPath("$.result.serverInfo.name").value("nexus-mcp-server"));
    }

    @Test
    @DisplayName("MCP POST /mcp tools/list returns all 4 required tools")
    void testMcpToolsList() throws Exception {
        McpProtocol.JsonRpcRequest request = new McpProtocol.JsonRpcRequest(
                "2.0",
                2,
                "tools/list",
                Map.of()
        );

        mockMvc.perform(post("/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.tools", hasSize(12)))
                .andExpect(jsonPath("$.result.tools[*].name", hasItems(
                        "create_task", "list_tasks", "update_task", "complete_task", "delete_task",
                        "get_upcoming_deadlines", "create_study_session", "list_study_sessions",
                        "reschedule_study_session", "detect_schedule_conflicts", "generate_study_plan",
                        "get_productivity_summary"
                )));
    }

    @Test
    @DisplayName("MCP POST /mcp tools/call executes addTask and listTasks")
    void testMcpToolsCall() throws Exception {
        // 1. Call addTask
        McpProtocol.JsonRpcRequest addRequest = new McpProtocol.JsonRpcRequest(
                "2.0",
                3,
                "tools/call",
                Map.of(
                        "name", "addTask",
                        "arguments", Map.of(
                                "title", "MCP Protocol Testing",
                                "subject", "Spring Boot",
                                "priority", "HIGH",
                                "dueDate", LocalDate.now().plusDays(2).toString(),
                                "estimatedMinutes", 60
                        )
                )
        );

        mockMvc.perform(post("/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isError").value(false))
                .andExpect(jsonPath("$.result.content[0].text").value(containsString("MCP Protocol Testing")));

        // 2. Call listTasks
        McpProtocol.JsonRpcRequest listRequest = new McpProtocol.JsonRpcRequest(
                "2.0",
                4,
                "tools/call",
                Map.of(
                        "name", "listTasks",
                        "arguments", Map.of("status", "ALL")
                )
        );

        mockMvc.perform(post("/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isError").value(false))
                .andExpect(jsonPath("$.result.content[0].text").value(containsString("MCP Protocol Testing")));
    }

    @Test
    @DisplayName("MCP POST /mcp tools/call executes generateStudyPlan")
    void testGenerateStudyPlanMcp() throws Exception {
        McpProtocol.JsonRpcRequest planRequest = new McpProtocol.JsonRpcRequest(
                "2.0",
                5,
                "tools/call",
                Map.of(
                        "name", "generateStudyPlan",
                        "arguments", Map.of(
                                "subject", "Database Systems",
                                "examDate", LocalDate.now().plusDays(5).toString(),
                                "dailyHoursAvailable", 2.0,
                                "topics", List.of("Normalization", "B+ Trees", "Transaction Isolation")
                        )
                )
        );

        mockMvc.perform(post("/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isError").value(false))
                .andExpect(jsonPath("$.result.content[0].text").value(containsString("totalSessionsCreated")));
    }

    @Test
    @DisplayName("GET /api/mcp/tools and /api/mcp/logs return telemetry")
    void testMcpTelemetryEndpoints() throws Exception {
        mockMvc.perform(get("/api/mcp/tools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(12)))
                .andExpect(jsonPath("$[0].status").value("Online"))
                .andExpect(jsonPath("$[0].sparkline").isArray());

        mockMvc.perform(get("/api/mcp/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].toolName").isNotEmpty())
                .andExpect(jsonPath("$[0].status").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/mcp/execute executes direct tool test")
    void testDirectMcpExecution() throws Exception {
        Map<String, Object> body = Map.of(
                "tool", "listTasks",
                "arguments", Map.of("status", "PENDING")
        );

        mockMvc.perform(post("/api/mcp/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toolName").value("listTasks"))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.executionDurationMs").isNumber());
    }

    @Test
    @DisplayName("POST /api/ai/chat and GET /api/ai/suggestions function properly")
    void testAiChatEndpoints() throws Exception {
        // Suggestions
        mockMvc.perform(get("/api/ai/suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[0]").value("Plan my study week."));

        // Chat invoking listTasks / upcoming deadlines
        Map<String, Object> chatBody = Map.of(
                "message", "Show my upcoming deadlines"
        );

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").isNotEmpty())
                .andExpect(jsonPath("$.toolCalls", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.toolCalls[0].tool").value("get_upcoming_deadlines"));

        // Chat with concept explanation
        Map<String, Object> conceptBody = Map.of(
                "message", "Explain binary search trees and AVL trees"
        );

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conceptBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value(containsString("AVL")));
    }
}
