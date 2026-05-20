package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.request.LogExerciseRequest;
import org.organizadorTreinos.dto.response.ExerciseLogResponse;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.ExerciseLog;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.ExerciseLogRepository;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class ExerciseLogService {

    private static final int DEFAULT_HISTORY_LIMIT = 10;

    @Inject
    ExerciseLogRepository exerciseLogRepository;

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    public ExerciseLogResponse logExecution(UUID workoutId, UUID exerciseId, User user,
                                            LogExerciseRequest request) {
        Workout workout = resolveWorkoutWithReadAccess(workoutId, user);
        Exercise exercise = resolveExerciseInWorkout(exerciseId, workout);

        ExerciseLog log = new ExerciseLog();
        log.setExercise(exercise);
        log.setUser(user);
        log.setWeight(request.getWeight());
        log.setReps(request.getReps());
        log.setSets(request.getSets());

        exerciseLogRepository.persist(log);

        return ExerciseLogResponse.from(log);
    }

    public List<ExerciseLogResponse> getHistory(UUID workoutId, UUID exerciseId, User user) {
        Workout workout = resolveWorkoutWithReadAccess(workoutId, user);
        resolveExerciseInWorkout(exerciseId, workout);

        return exerciseLogRepository
                .findRecentByExerciseAndUser(exerciseId, user.getId(), DEFAULT_HISTORY_LIMIT)
                .stream()
                .map(ExerciseLogResponse::from)
                .collect(Collectors.toList());
    }

    private Workout resolveWorkoutWithReadAccess(UUID workoutId, User user) {
        Workout workout = workoutRepository.find("id", workoutId)
                .firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Workout not found"));

        boolean isOwner = workout.getUser().getId().equals(user.getId());
        boolean isShared = workoutShareRepository.isSharedWith(workout, user);

        if (!isOwner && !isShared) {
            throw new ForbiddenException("You don't have access to this workout");
        }

        return workout;
    }

    private Exercise resolveExerciseInWorkout(UUID exerciseId, Workout workout) {
        Exercise exercise = exerciseRepository.find("id", exerciseId)
                .firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Exercise not found"));

        if (!exercise.getWorkout().getId().equals(workout.getId())) {
            throw new NotFoundException("Exercise not found in this workout");
        }

        return exercise;
    }
}
