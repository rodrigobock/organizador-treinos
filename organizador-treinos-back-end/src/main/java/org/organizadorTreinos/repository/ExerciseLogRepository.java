package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.ExerciseLog;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ExerciseLogRepository implements PanacheRepository<ExerciseLog> {

    public List<ExerciseLog> findRecentByExerciseAndUser(UUID exerciseId, UUID userId, int limit) {
        return find(
            "exercise.id = ?1 AND user.id = ?2 ORDER BY loggedAt DESC",
            exerciseId,
            userId
        ).page(0, limit).list();
    }
}
