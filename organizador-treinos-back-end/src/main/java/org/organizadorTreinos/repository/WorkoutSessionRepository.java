package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.WorkoutSession;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WorkoutSessionRepository implements PanacheRepository<WorkoutSession> {

    public Optional<WorkoutSession> findActiveSession(UUID workoutId, UUID userId) {
        return find("workout.id = ?1 AND user.id = ?2 AND endedAt IS NULL", workoutId, userId)
                .firstResultOptional();
    }
}
