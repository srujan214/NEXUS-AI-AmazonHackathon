package com.nexus.ai.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName = "Alex";

    @Column(name = "student_email", length = 100)
    private String studentEmail = "alex@nexus.edu";

    @Column(name = "academic_major", length = 100)
    private String academicMajor = "Computer Science";

    @Column(name = "weekly_focus_goal_hours")
    private Integer weeklyFocusGoalHours = 20;

    @Column(name = "ai_provider", length = 50)
    private String aiProvider = "GEMINI";

    @Column(name = "ai_model", length = 100)
    private String aiModel = "gemini-1.5-pro";

    @Column(name = "has_custom_api_key")
    private Boolean hasCustomApiKey = false;

    @Column(name = "api_key_masked", length = 50)
    private String apiKeyMasked;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public SystemSettings() {}

    public SystemSettings(String studentName, String studentEmail, String academicMajor, Integer weeklyFocusGoalHours) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.academicMajor = academicMajor;
        this.weeklyFocusGoalHours = weeklyFocusGoalHours;
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getAcademicMajor() {
        return academicMajor;
    }

    public void setAcademicMajor(String academicMajor) {
        this.academicMajor = academicMajor;
    }

    public Integer getWeeklyFocusGoalHours() {
        return weeklyFocusGoalHours;
    }

    public void setWeeklyFocusGoalHours(Integer weeklyFocusGoalHours) {
        this.weeklyFocusGoalHours = weeklyFocusGoalHours;
    }

    public String getAiProvider() {
        return aiProvider;
    }

    public void setAiProvider(String aiProvider) {
        this.aiProvider = aiProvider;
    }

    public String getAiModel() {
        return aiModel;
    }

    public void setAiModel(String aiModel) {
        this.aiModel = aiModel;
    }

    public Boolean getHasCustomApiKey() {
        return hasCustomApiKey;
    }

    public void setHasCustomApiKey(Boolean hasCustomApiKey) {
        this.hasCustomApiKey = hasCustomApiKey;
    }

    public String getApiKeyMasked() {
        return apiKeyMasked;
    }

    public void setApiKeyMasked(String apiKeyMasked) {
        this.apiKeyMasked = apiKeyMasked;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
