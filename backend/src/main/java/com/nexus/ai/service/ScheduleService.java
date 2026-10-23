package com.nexus.ai.service;

import com.nexus.ai.dto.ScheduleDto;
import com.nexus.ai.model.StudySession;
import com.nexus.ai.repository.StudySessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ScheduleService {

    private final StudySessionRepository studySessionRepository;

    public ScheduleService(StudySessionRepository studySessionRepository) {
        this.studySessionRepository = studySessionRepository;
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto.Response> getSchedule(Instant start, Instant end) {
        Instant startTime = start != null ? start : Instant.now().minus(3, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
        Instant endTime = end != null ? end : startTime.plus(7, ChronoUnit.DAYS);

        List<StudySession> sessions = studySessionRepository.findByStartTimeBetweenOrderByStartTimeAsc(startTime, endTime);
        return sessions.stream().map(ScheduleDto.Response::fromEntity).toList();
    }

    @Transactional
    public ScheduleDto.Response createSession(ScheduleDto.CreateRequest request) {
        int duration = request.durationMinutes() != null && request.durationMinutes() > 0 ?
                request.durationMinutes() :
                (int) ChronoUnit.MINUTES.between(request.startTime(), request.endTime());

        StudySession session = new StudySession(
                request.title(),
                request.subject(),
                request.startTime(),
                request.endTime(),
                duration,
                request.taskId()
        );
        session.setNotes(request.notes());

        StudySession saved = studySessionRepository.save(session);
        return ScheduleDto.Response.fromEntity(saved);
    }

    @Transactional
    public ScheduleDto.Response updateSession(Long id, ScheduleDto.UpdateRequest request) {
        StudySession session = studySessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study session not found with id: " + id));

        session.setTitle(request.title());
        session.setSubject(request.subject());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        if (request.durationMinutes() != null) {
            session.setDurationMinutes(request.durationMinutes());
        }
        if (request.status() != null) {
            session.setStatus(request.status());
        }
        session.setTaskId(request.taskId());
        session.setNotes(request.notes());

        StudySession updated = studySessionRepository.save(session);
        return ScheduleDto.Response.fromEntity(updated);
    }

    @Transactional
    public void deleteSession(Long id) {
        if (!studySessionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Study session not found with id: " + id);
        }
        studySessionRepository.deleteById(id);
    }
}
