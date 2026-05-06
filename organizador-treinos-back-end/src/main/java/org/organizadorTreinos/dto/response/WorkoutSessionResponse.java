package org.organizadorTreinos.dto.response;

import org.organizadorTreinos.entity.WorkoutSession;

import java.time.LocalDateTime;
import java.util.UUID;

public record WorkoutSessionResponse(
        UUID id,
        UUID workoutId,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        boolean active
) {
    public static WorkoutSessionResponse from(WorkoutSession session) {
        return new WorkoutSessionResponse(
                session.getId(),
                session.getWorkout().getId(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getEndedAt() == null
        );
    }
}
