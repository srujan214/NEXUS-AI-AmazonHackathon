package com.nexus.ai.repository;

import com.nexus.ai.model.Mission;
import com.nexus.ai.model.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findAllByOrderByCreatedAtDesc();
    List<Mission> findByStatus(MissionStatus status);
}
