package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
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

import org.organizadorTreinos.dto.request.ExerciseImportItem;
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ImportAnalyzeResultItem> analyzeImport(User user, ImportAnalyzeRequest request) {
        List<Workout> existingWorkouts = workoutRepository.findByUser(user);
        List<ImportAnalyzeResultItem> results = new ArrayList<>();

        for (ImportWorkoutItem incoming : request.getWorkouts()) {
            Optional<Workout> nameMatch = existingWorkouts.stream()
                .filter(w -> w.getName().equalsIgnoreCase(incoming.getName()))
                .findFirst();

            if (nameMatch.isEmpty()) {
                results.add(new ImportAnalyzeResultItem(incoming, "clean", null, null));
                continue;
            }

            Workout existing = nameMatch.get();
            List<String> existingNames = exerciseRepository.findByWorkout(existing)
                .stream().map(Exercise::getName).collect(Collectors.toList());
            List<String> incomingNames = incoming.getExercises().stream()
                .map(ExerciseImportItem::getName).collect(Collectors.toList());

            double similarity = jaccardSimilarity(existingNames, incomingNames);

            if (similarity >= 0.75) {
                results.add(new ImportAnalyzeResultItem(incoming, "duplicate", existing.getId(), similarity));
            } else {
                results.add(new ImportAnalyzeResultItem(incoming, "clean", null, null));
            }
        }

        return results;
    }

    public ImportResultResponse confirmImport(User user, List<ImportConfirmItem> items) {
        for (ImportConfirmItem item : items) {
            if ("replace".equals(item.getAction())) {
                if (item.getConflictId() == null) {
                    throw new BadRequestException("conflictId required for action 'replace'");
                }
                Workout target = workoutRepository.find("id", item.getConflictId())
                    .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));
                if (!target.getUser().getId().equals(user.getId())) {
                    throw new ForbiddenException("Only the owner can replace this workout");
                }
            }
        }
        int created = 0, replaced = 0, skipped = 0;
        for (ImportConfirmItem item : items) {
            switch (item.getAction()) {
                case "create" -> { createFromImport(user, item.getWorkout()); created++; }
                case "replace" -> { replaceFromImport(user, item.getConflictId(), item.getWorkout()); replaced++; }
                case "skip" -> skipped++;
            }
        }
        return new ImportResultResponse(created, replaced, skipped);
    }

    private void createFromImport(User user, ImportWorkoutItem item) {
        Workout workout = new Workout();
        workout.setName(item.getName());
        workout.setUser(user);
        workout.setIsPublic(false);
        workoutRepository.persist(workout);
        for (ExerciseImportItem ex : item.getExercises()) {
            Exercise exercise = new Exercise();
            exercise.setName(ex.getName());
            exercise.setCompleted(ex.getCompleted() != null && ex.getCompleted());
            exercise.setWorkout(workout);
            exerciseRepository.persist(exercise);
        }
    }

    private void replaceFromImport(User user, UUID conflictId, ImportWorkoutItem item) {
        Workout existing = workoutRepository.find("id", conflictId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the owner can replace this workout");
        }
        exerciseRepository.delete("workout", existing);
        existing.setName(item.getName());
        workoutRepository.persist(existing);
        for (ExerciseImportItem ex : item.getExercises()) {
            Exercise exercise = new Exercise();
            exercise.setName(ex.getName());
            exercise.setCompleted(ex.getCompleted() != null && ex.getCompleted());
            exercise.setWorkout(existing);
            exerciseRepository.persist(exercise);
        }
    }

    private double jaccardSimilarity(List<String> a, List<String> b) {
        Set<String> setA = a.stream().map(String::toLowerCase).collect(Collectors.toSet());
        Set<String> setB = b.stream().map(String::toLowerCase).collect(Collectors.toSet());

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        return (double) intersection.size() / union.size();
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
