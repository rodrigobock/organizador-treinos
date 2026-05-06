package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.request.CreateWorkoutRequest;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutShare;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class WorkoutService {

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    @Inject
    UserRepository userRepository;

    // 🔥 CRITICAL: Authorization check before accessing any workout
    private void checkWorkoutAccess(Workout workout, User user) {
        if (workout.getUser().getId().equals(user.getId())) {
            return; // Owner has access
        }

        if (workoutShareRepository.isSharedWith(workout, user)) {
            return; // User has shared access
        }

        throw new ForbiddenException("You don't have access to this workout");
    }

    public WorkoutResponse createWorkout(User user, CreateWorkoutRequest request) {
        Workout workout = new Workout();
        workout.setName(request.getName());
        workout.setUser(user);
        workout.setIsPublic(request.getIsPublic());

        workoutRepository.persist(workout);

        return toResponse(workout);
    }

    public List<WorkoutResponse> getUserWorkouts(User user) {
        return workoutRepository.findByUser(user).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<WorkoutResponse> getSharedWorkouts(User user) {
        return workoutShareRepository.findBySharedWithUser(user).stream()
            .map(share -> toResponse(share.getWorkout()))
            .collect(Collectors.toList());
    }

    public WorkoutResponse getWorkout(UUID workoutId, User user) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        checkWorkoutAccess(workout, user);

        WorkoutResponse response = toResponse(workout);
        response.setExercises(
            exerciseRepository.findByWorkout(workout).stream()
                .map(this::toExerciseResponse)
                .collect(Collectors.toList())
        );

        return response;
    }

    public WorkoutResponse updateWorkout(UUID workoutId, User user, CreateWorkoutRequest request) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        // Only owner can update (not shared users with EDIT permission)
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the owner can update this workout");
        }

        workout.setName(request.getName());
        workout.setIsPublic(request.getIsPublic());
        workoutRepository.persist(workout);

        return toResponse(workout);
    }

    public void deleteWorkout(UUID workoutId, User user) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the owner can delete this workout");
        }

        workoutRepository.delete("id", workoutId);
    }

    public List<WorkoutResponse> getPublicWorkouts() {
        return workoutRepository.findPublicWorkouts().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private WorkoutResponse toResponse(Workout workout) {
        return new WorkoutResponse(
            workout.getId(),
            workout.getName(),
            workout.getUser().getId(),
            workout.getIsPublic(),
            workout.getCreatedAt(),
            workout.getUpdatedAt()
        );
    }

    private ExerciseResponse toExerciseResponse(Exercise exercise) {
        return new ExerciseResponse(
            exercise.getId(),
            exercise.getName(),
            exercise.getCompleted(),
            exercise.getCreatedAt(),
            exercise.getUpdatedAt()
        );
    }
}
