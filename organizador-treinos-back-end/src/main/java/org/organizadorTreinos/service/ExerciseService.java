package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.request.CreateExerciseRequest;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import java.util.UUID;

@ApplicationScoped
@Transactional
public class ExerciseService {

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    private void checkEditPermission(Workout workout, User user) {
        // Only owner can edit
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the workout owner can edit exercises");
        }
    }

    public ExerciseResponse createExercise(UUID workoutId, User user, CreateExerciseRequest request) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        checkEditPermission(workout, user);

        Exercise exercise = new Exercise();
        exercise.setName(request.getName());
        exercise.setWorkout(workout);
        exercise.setCompleted(false);

        exerciseRepository.persist(exercise);

        return toResponse(exercise);
    }

    public ExerciseResponse updateExercise(UUID workoutId, UUID exerciseId, User user,
                                          CreateExerciseRequest request) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        checkEditPermission(workout, user);

        Exercise exercise = exerciseRepository.find("id", exerciseId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Exercise not found"));

        if (!exercise.getWorkout().getId().equals(workoutId)) {
            throw new NotFoundException("Exercise not found in this workout");
        }

        exercise.setName(request.getName());
        exerciseRepository.persist(exercise);

        return toResponse(exercise);
    }

    public ExerciseResponse toggleExerciseCompletion(UUID workoutId, UUID exerciseId, User user) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        // Owner or user with EDIT permission can toggle
        if (!workout.getUser().getId().equals(user.getId()) &&
            !workoutShareRepository.isSharedWith(workout, user)) {
            throw new ForbiddenException("You don't have access to this workout");
        }

        Exercise exercise = exerciseRepository.find("id", exerciseId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Exercise not found"));

        if (!exercise.getWorkout().getId().equals(workoutId)) {
            throw new NotFoundException("Exercise not found in this workout");
        }

        exercise.setCompleted(!exercise.getCompleted());
        exerciseRepository.persist(exercise);

        return toResponse(exercise);
    }

    public void deleteExercise(UUID workoutId, UUID exerciseId, User user) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        checkEditPermission(workout, user);

        Exercise exercise = exerciseRepository.find("id", exerciseId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Exercise not found"));

        if (!exercise.getWorkout().getId().equals(workoutId)) {
            throw new NotFoundException("Exercise not found in this workout");
        }

        exerciseRepository.delete("id", exerciseId);
    }

    public void resetExercises(Workout workout) {
        exerciseRepository.resetCompletionByWorkout(workout);
    }

    private ExerciseResponse toResponse(Exercise exercise) {
        return new ExerciseResponse(
            exercise.getId(),
            exercise.getName(),
            exercise.getCompleted(),
            exercise.getCreatedAt(),
            exercise.getUpdatedAt()
        );
    }
}
