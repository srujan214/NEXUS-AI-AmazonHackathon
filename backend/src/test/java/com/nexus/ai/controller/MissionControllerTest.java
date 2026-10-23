package com.nexus.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.dto.MissionDto;
import com.nexus.ai.model.MissionStatus;
import com.nexus.ai.repository.McpToolExecutionLogRepository;
import com.nexus.ai.repository.StudySessionRepository;
import com.nexus.ai.repository.TaskRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class MissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StudySessionRepository sessionRepository;

    @Autowired
    private McpToolExecutionLogRepository mcpLogRepository;

    @Test
    @DisplayName("Complete Mission Control Flagship Workflow: Plan -> Review -> Approve -> MCP Execution")
    void testMissionControlFlagshipWorkflow() throws Exception {
        long initialSessions = sessionRepository.count();
        long initialMcpLogs = mcpLogRepository.count();

        // 1. Submit high-level goal to plan mission
        MissionDto.CreateRequest request = new MissionDto.CreateRequest(
                "Prepare for my Java 25 exam in five days, 2 hours available daily",
                2.0,
                Instant.now().plus(5, ChronoUnit.DAYS)
        );

        String planResultJson = mockMvc.perform(post("/api/missions/plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("AWAITING_APPROVAL"))
                .andExpect(jsonPath("$.proposedPlanJson").isNotEmpty())
                .andExpect(jsonPath("$.steps").isArray())
                .andReturn().getResponse().getContentAsString();

        MissionDto.Response missionPlanned = objectMapper.readValue(planResultJson, MissionDto.Response.class);
        Long missionId = missionPlanned.id();
        assertThat(missionPlanned.status()).isEqualTo(MissionStatus.AWAITING_APPROVAL);

        // Verify that database was NOT yet modified before approval
        assertThat(sessionRepository.count()).isEqualTo(initialSessions);

        // 2. Approve and execute mission through real MCP tools
        String approveResultJson = mockMvc.perform(post("/api/missions/" + missionId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.executionSummaryJson").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        MissionDto.Response missionApproved = objectMapper.readValue(approveResultJson, MissionDto.Response.class);
        assertThat(missionApproved.status()).isEqualTo(MissionStatus.COMPLETED);

        // 3. Verify real changes were persisted in the database via MCP tools
        long finalSessions = sessionRepository.count();
        long finalMcpLogs = mcpLogRepository.count();

        assertThat(finalSessions).isGreaterThan(initialSessions);
        assertThat(finalMcpLogs).isGreaterThan(initialMcpLogs);

        // 4. Query mission by ID
        mockMvc.perform(get("/api/missions/" + missionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.steps").isNotEmpty());
    }
}
