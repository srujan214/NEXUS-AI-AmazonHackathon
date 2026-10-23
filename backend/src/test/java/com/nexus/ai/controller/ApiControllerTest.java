package com.nexus.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.ai.dto.ScheduleDto;
import com.nexus.ai.dto.SettingsDto;
import com.nexus.ai.dto.TaskDto;
import com.nexus.ai.model.Priority;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/tasks returns seeded tasks")
    void testGetTasks() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(12))))
                .andExpect(jsonPath("$[0].title").isNotEmpty())
                .andExpect(jsonPath("$[0].subject").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/tasks creates task and PATCH toggles status")
    void testTaskCreateAndToggle() throws Exception {
        TaskDto.CreateRequest request = new TaskDto.CreateRequest(
                "Build automated tests",
                "Ensure 100% test pass on CI",
                "DevOps",
                Priority.HIGH,
                Instant.now().plus(1, ChronoUnit.DAYS),
                45
        );

        String responseContent = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Build automated tests"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        long taskId = objectMapper.readTree(responseContent).get("id").asLong();

        // Toggle task
        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());

        // Toggle back
        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.completedAt").doesNotExist());

        // Delete
        mockMvc.perform(delete("/api/tasks/" + taskId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/schedule returns calendar sessions")
    void testGetSchedule() throws Exception {
        mockMvc.perform(get("/api/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[0].title").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/schedule/session creates a new study session")
    void testCreateScheduleSession() throws Exception {
        Instant start = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant end = start.plus(90, ChronoUnit.MINUTES);

        ScheduleDto.CreateRequest request = new ScheduleDto.CreateRequest(
                "Deep Work on Algorithms",
                "Algorithms",
                start,
                end,
                90,
                null,
                "Focus on graph algorithms"
        );

        mockMvc.perform(post("/api/schedule/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Deep Work on Algorithms"))
                .andExpect(jsonPath("$.durationMinutes").value(90));
    }

    @Test
    @DisplayName("GET /api/analytics returns dynamic dashboard metrics")
    void testGetAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overview.activeTasks").value(greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.overview.upcomingDeadlines").isNumber())
                .andExpect(jsonPath("$.overview.focusHoursThisWeek").isNumber())
                .andExpect(jsonPath("$.overview.weeklyProgressPercent").isNumber())
                .andExpect(jsonPath("$.activityTrend", hasSize(7)))
                .andExpect(jsonPath("$.subjectBreakdown").isArray())
                .andExpect(jsonPath("$.insights", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("GET and PUT /api/settings manages student preferences")
    void testSettings() throws Exception {
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName").value("Alex"))
                .andExpect(jsonPath("$.academicMajor").value("Computer Science"));

        SettingsDto.UpdateRequest update = new SettingsDto.UpdateRequest(
                "Alex Rivera",
                "alex.rivera@nexus.edu",
                "Software Engineering",
                25,
                "GEMINI",
                "gemini-1.5-pro",
                "sk-test-sample-key-12345"
        );

        mockMvc.perform(put("/api/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName").value("Alex Rivera"))
                .andExpect(jsonPath("$.hasCustomApiKey").value(true))
                .andExpect(jsonPath("$.apiKeyMasked").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/system/seed reseeds database successfully")
    void testReseed() throws Exception {
        mockMvc.perform(post("/api/system/seed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
