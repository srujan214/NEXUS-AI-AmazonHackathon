package com.nexus.ai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "focus_logs")
public class FocusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Subject is required")
    @Column(nullable = false, length = 100)
    private String subject;

    @NotNull
    @Column(name = "minutes_focused", nullable = false)
    private Integer minutesFocused;

    @NotNull
    @Column(name = "logged_date", nullable = false)
    private LocalDate loggedDate;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "efficiency_score")
    private Double efficiencyScore = 1.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public FocusLog() {}

    public FocusLog(String subject, Integer minutesFocused, LocalDate loggedDate, Long sessionId, Double efficiencyScore) {
        this.subject = subject;
        this.minutesFocused = minutesFocused;
        this.loggedDate = loggedDate;
        this.sessionId = sessionId;
        this.efficiencyScore = efficiencyScore != null ? efficiencyScore : 1.0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.efficiencyScore == null) {
            this.efficiencyScore = 1.0;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getMinutesFocused() {
        return minutesFocused;
    }

    public void setMinutesFocused(Integer minutesFocused) {
        this.minutesFocused = minutesFocused;
    }

    public LocalDate getLoggedDate() {
        return loggedDate;
    }

    public void setLoggedDate(LocalDate loggedDate) {
        this.loggedDate = loggedDate;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Double getEfficiencyScore() {
        return efficiencyScore;
    }

    public void setEfficiencyScore(Double efficiencyScore) {
        this.efficiencyScore = efficiencyScore;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
