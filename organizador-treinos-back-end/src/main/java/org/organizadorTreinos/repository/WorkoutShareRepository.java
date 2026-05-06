package org.organizadorTreinos.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.WorkoutShare;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WorkoutShareRepository {

    @Inject
    EntityManager entityManager;

    public Optional<WorkoutShare> findByWorkoutAndUser(Workout workout, User user) {
        return entityManager.createQuery("SELECT ws FROM WorkoutShare ws WHERE ws.workout = :workout AND ws.sharedWithUser = :user", WorkoutShare.class)
                .setParameter("workout", workout)
                .setParameter("user", user)
                .getResultStream()
                .findFirst();
    }

    public List<WorkoutShare> findBySharedWithUser(User user) {
        return entityManager.createQuery("SELECT ws FROM WorkoutShare ws WHERE ws.sharedWithUser = :user", WorkoutShare.class)
                .setParameter("user", user)
                .getResultList();
    }

    public List<WorkoutShare> findByWorkout(Workout workout) {
        return entityManager.createQuery("SELECT ws FROM WorkoutShare ws WHERE ws.workout = :workout", WorkoutShare.class)
                .setParameter("workout", workout)
                .getResultList();
    }

    public void deleteByWorkoutAndUser(Workout workout, User user) {
        entityManager.createQuery("DELETE FROM WorkoutShare ws WHERE ws.workout = :workout AND ws.sharedWithUser = :user")
                .setParameter("workout", workout)
                .setParameter("user", user)
                .executeUpdate();
    }

    public boolean isSharedWith(Workout workout, User user) {
        return entityManager.createQuery("SELECT COUNT(ws) FROM WorkoutShare ws WHERE ws.workout = :workout AND ws.sharedWithUser = :user", Long.class)
                .setParameter("workout", workout)
                .setParameter("user", user)
                .getSingleResult() > 0;
    }

    public void persist(WorkoutShare entity) {
        entityManager.persist(entity);
    }

    public void deleteAll() {
        entityManager.createQuery("DELETE FROM WorkoutShare").executeUpdate();
    }
    // Panache-specific deleteAll is not available here, would need to be re-implemented if used
    // public void deleteAll() {
    //    entityManager.createQuery("DELETE FROM WorkoutShare").executeUpdate();
    // }
}


