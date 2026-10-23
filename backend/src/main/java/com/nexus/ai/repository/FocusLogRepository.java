package com.nexus.ai.repository;

import com.nexus.ai.model.FocusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FocusLogRepository extends JpaRepository<FocusLog, Long> {

    List<FocusLog> findByLoggedDateBetweenOrderByLoggedDateAsc(LocalDate startDate, LocalDate endDate);

    List<FocusLog> findBySubject(String subject);

    @Query("SELECT COALESCE(SUM(f.minutesFocused), 0) FROM FocusLog f WHERE f.loggedDate >= :startDate AND f.loggedDate <= :endDate")
    long sumMinutesFocusedBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT f.subject, SUM(f.minutesFocused) FROM FocusLog f GROUP BY f.subject")
    List<Object[]> sumMinutesBySubject();
}
