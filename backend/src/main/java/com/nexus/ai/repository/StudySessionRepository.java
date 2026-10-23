package com.nexus.ai.repository;

import com.nexus.ai.model.SessionStatus;
import com.nexus.ai.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByStartTimeBetweenOrderByStartTimeAsc(Instant start, Instant end);

    List<StudySession> findByStatus(SessionStatus status);

    long countByStatus(SessionStatus status);

    @Query("SELECT s FROM StudySession s WHERE s.startTime >= :since ORDER BY s.startTime ASC")
    List<StudySession> findUpcomingSessions(@Param("since") Instant since);
}
