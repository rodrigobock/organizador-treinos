package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.ExerciseSession;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ExerciseSessionRepository implements PanacheRepository<ExerciseSession> {

    public Optional<ExerciseSession> findByExerciseAndSession(UUID exerciseId, UUID sessionId) {
        return find("exercise.id = ?1 AND session.id = ?2", exerciseId, sessionId).firstResultOptional();
    }

    public void deleteBySessionId(UUID sessionId) {
        delete("session.id = ?1", sessionId);
    }
}
