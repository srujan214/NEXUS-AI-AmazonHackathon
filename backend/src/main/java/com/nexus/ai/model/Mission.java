package com.nexus.ai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Goal is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String goal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MissionStatus status = MissionStatus.UNDERSTANDING;

    @Column(name = "target_date")
    private Instant targetDate;

    @Column(name = "daily_hours_available")
    private Double dailyHoursAvailable = 2.0;

    @Column(name = "conflicts_detected")
    private Integer conflictsDetected = 0;

    @Column(name = "conflict_details", columnDefinition = "TEXT")
    private String conflictDetails;

    @Column(name = "proposed_plan_json", columnDefinition = "TEXT")
    private String proposedPlanJson;

    @Column(name = "execution_summary_json", columnDefinition = "TEXT")
    private String executionSummaryJson;

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MissionStep> steps = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Mission() {}

    public Mission(String goal, Double dailyHoursAvailable, Instant targetDate) {
        this.goal = goal;
        this.dailyHoursAvailable = dailyHoursAvailable != null ? dailyHoursAvailable : 2.0;
        this.targetDate = targetDate;
        this.status = MissionStatus.UNDERSTANDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = MissionStatus.UNDERSTANDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addStep(MissionStep step) {
        steps.add(step);
        step.setMission(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public MissionStatus getStatus() {
        return status;
    }

    public void setStatus(MissionStatus status) {
        this.status = status;
    }

    public Instant getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(Instant targetDate) {
        this.targetDate = targetDate;
    }

    public Double getDailyHoursAvailable() {
        return dailyHoursAvailable;
    }

    public void setDailyHoursAvailable(Double dailyHoursAvailable) {
        this.dailyHoursAvailable = dailyHoursAvailable;
    }

    public Integer getConflictsDetected() {
        return conflictsDetected;
    }

    public void setConflictsDetected(Integer conflictsDetected) {
        this.conflictsDetected = conflictsDetected;
    }

    public String getConflictDetails() {
        return conflictDetails;
    }

    public void setConflictDetails(String conflictDetails) {
        this.conflictDetails = conflictDetails;
    }

    public String getProposedPlanJson() {
        return proposedPlanJson;
    }

    public void setProposedPlanJson(String proposedPlanJson) {
        this.proposedPlanJson = proposedPlanJson;
    }

    public String getExecutionSummaryJson() {
        return executionSummaryJson;
    }

    public void setExecutionSummaryJson(String executionSummaryJson) {
        this.executionSummaryJson = executionSummaryJson;
    }

    public List<MissionStep> getSteps() {
        return steps;
    }

    public void setSteps(List<MissionStep> steps) {
        this.steps = steps;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
