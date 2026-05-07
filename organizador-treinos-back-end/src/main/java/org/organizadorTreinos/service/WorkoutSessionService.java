package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.response.WorkoutSessionResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutSession;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutSessionRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WorkoutSessionService {

    @Inject
    WorkoutSessionRepository sessionRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    WorkoutService workoutService;

    @Transactional
    public WorkoutSessionResponse startSession(UUID workoutId, User user) {
        Workout workout = workoutRepository.find("id", workoutId).firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Treino não encontrado"));

        sessionRepository.findActiveSession(workoutId, user.getId())
                .ifPresent(s -> { throw new BadRequestException("Já existe uma sessão ativa para este treino"); });

        WorkoutSession session = new WorkoutSession();
        session.setWorkout(workout);
        session.setUser(user);
        session.setStartedAt(LocalDateTime.now());
        sessionRepository.persist(session);

        return WorkoutSessionResponse.from(session);
    }

    @Transactional
    public WorkoutSessionResponse endSession(UUID workoutId, UUID sessionId, User user) {
        WorkoutSession session = sessionRepository.find("id", sessionId).firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Sessão não encontrada"));

        if (!session.getWorkout().getId().equals(workoutId)) {
            throw new NotFoundException("Sessão não pertence a este treino");
        }
        if (!session.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Sessão não encontrada");
        }
        if (session.getEndedAt() != null) {
            throw new BadRequestException("Sessão já foi finalizada");
        }

        session.setEndedAt(LocalDateTime.now());
        workoutService.advanceCurrentWorkout(user, workoutId);
        return WorkoutSessionResponse.from(session);
    }

    public Optional<WorkoutSessionResponse> getActiveSession(UUID workoutId, User user) {
        return sessionRepository.findActiveSession(workoutId, user.getId())
                .map(WorkoutSessionResponse::from);
    }
}
