package org.organizadorTreinos.dto.response;

import org.organizadorTreinos.entity.ExerciseLog;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExerciseLogResponse(
        UUID id,
        UUID exerciseId,
        Double weight,
        Integer reps,
        Integer sets,
        LocalDateTime loggedAt
) {
    public static ExerciseLogResponse from(ExerciseLog log) {
        return new ExerciseLogResponse(
                log.getId(),
                log.getExercise().getId(),
                log.getWeight(),
                log.getReps(),
                log.getSets(),
                log.getLoggedAt()
        );
    }
}
