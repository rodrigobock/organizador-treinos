package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.request.CreateExerciseRequest;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.ExerciseSession;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutSession;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.ExerciseSessionRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutSessionRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import java.util.UUID;

@ApplicationScoped
@Transactional
public class ExerciseService {

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    ExerciseSessionRepository exerciseSessionRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    WorkoutSessionRepository workoutSessionRepository;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    private void checkEditPermission(Workout workout, User user) {
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

        exerciseRepository.persist(exercise);

        return toResponse(exercise, user);
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

        return toResponse(exercise, user);
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

        // Get active session
        WorkoutSession activeSession = workoutSessionRepository.findActiveSession(workoutId, user.getId())
            .orElseThrow(() -> new NotFoundException("No active session for this workout"));

        // Toggle: if exists, delete; if not exists, create
        var existingEntry = exerciseSessionRepository.findByExerciseAndSession(exerciseId, activeSession.getId());
        if (existingEntry.isPresent()) {
            exerciseSessionRepository.delete("id", existingEntry.get().getId());
        } else {
            ExerciseSession entry = new ExerciseSession();
            entry.setExercise(exercise);
            entry.setSession(activeSession);
            exerciseSessionRepository.persist(entry);
        }

        return toResponse(exercise, user);
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

    public void resetExercises(UUID workoutId, UUID userId) {
        WorkoutSession session = workoutSessionRepository.findActiveSession(workoutId, userId)
            .orElse(null);

        if (session != null) {
            exerciseSessionRepository.deleteBySessionId(session.getId());
        }
    }

    public ExerciseResponse toExerciseResponse(Exercise exercise, User user) {
        // Find active session for user on this workout
        var activeSession = workoutSessionRepository.findActiveSession(exercise.getWorkout().getId(), user.getId());

        // Check if exercise is completed in active session
        boolean completed = false;
        if (activeSession.isPresent()) {
            completed = exerciseSessionRepository.findByExerciseAndSession(
                exercise.getId(), activeSession.get().getId()
            ).isPresent();
        }

        return new ExerciseResponse(
            exercise.getId(),
            exercise.getName(),
            completed,
            exercise.getCreatedAt(),
            exercise.getUpdatedAt()
        );
    }

    private ExerciseResponse toResponse(Exercise exercise, User user) {
        return toExerciseResponse(exercise, user);
    }
}
