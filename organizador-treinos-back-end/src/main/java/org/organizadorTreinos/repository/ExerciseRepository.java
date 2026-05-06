package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.Workout;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ExerciseRepository implements PanacheRepository<Exercise> {

    public List<Exercise> findByWorkout(Workout workout) {
        return find("workout", workout).list();
    }

    public Optional<Exercise> findByIdAndWorkout(UUID id, Workout workout) {
        return find("id = ?1 and workout = ?2", id, workout).firstResultOptional();
    }

    public void deleteByIdAndWorkout(UUID id, Workout workout) {
        delete("id = ?1 and workout = ?2", id, workout);
    }

    public List<Exercise> findIncompleteByWorkout(Workout workout) {
        return find("workout = ?1 and completed = false", workout).list();
    }
}
