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
import org.organizadorTreinos.dto.response.PagedResponse;
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
    ExerciseService exerciseService;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    @Inject
    WorkoutShareService workoutShareService;

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

    public WorkoutResponse createWorkout(UUID userId, CreateWorkoutRequest request) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
        long count = workoutRepository.countByUser(user);

        Workout workout = new Workout();
        workout.setName(request.getName());
        workout.setUser(user);
        workout.setIsPublic(request.getIsPublic());
        workout.setPosition((int) count);

        workoutRepository.persist(workout);

        if (count == 0) {
            user.setCurrentWorkoutId(workout.getId());
        }

        return toResponse(workout);
    }

    private List<WorkoutResponse> getUnifiedUserWorkouts(User user) {
        List<Workout> owned = workoutRepository.findByUser(user);
        List<WorkoutShare> shared = workoutShareRepository.findBySharedWithUser(user);

        class OrderedWorkout {
            final Workout workout;
            final int position;
            OrderedWorkout(Workout w, int p) { this.workout = w; this.position = p; }
        }

        List<OrderedWorkout> combined = new ArrayList<>();
        for (Workout w : owned) {
            combined.add(new OrderedWorkout(w, w.getPosition()));
        }
        for (WorkoutShare s : shared) {
            combined.add(new OrderedWorkout(s.getWorkout(), s.getPosition()));
        }

        combined.sort((a, b) -> Integer.compare(a.position, b.position));

        return combined.stream()
            .map(o -> toResponse(o.workout))
            .collect(Collectors.toList());
    }

    public List<WorkoutResponse> getUserWorkouts(User user) {
        return getUnifiedUserWorkouts(user);
    }

    public PagedResponse<WorkoutResponse> getUserWorkoutsPaged(User user, int page, int size) {
        List<WorkoutResponse> all = getUnifiedUserWorkouts(user);
        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());
        List<WorkoutResponse> content = all.subList(start, end);
        long total = all.size();
        return new PagedResponse<>(content, page, size, total);
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

        // Record access time for non-owners (trainer dashboard tracking)
        if (!workout.getUser().getId().equals(user.getId())) {
            workoutShareService.recordAccess(workout, user);
        }

        WorkoutResponse response = toResponse(workout);
        response.setExercises(
            exerciseRepository.findByWorkout(workout).stream()
                .map(exercise -> exerciseService.toExerciseResponse(exercise, user))
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

    public void deleteWorkout(UUID workoutId, UUID userId) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        if (!workout.getUser().getId().equals(user.getId())) {
            Optional<WorkoutShare> shareOpt = workoutShareRepository.findByWorkoutAndUser(workout, user);
            if (shareOpt.isPresent()) {
                if (workoutId.equals(user.getCurrentWorkoutId())) {
                    advanceCurrentWorkout(userId, workoutId);
                }
                workoutShareRepository.deleteByWorkoutAndUser(workout, user);
                return;
            } else {
                throw new ForbiddenException("Only the owner can delete this workout");
            }
        }

        if (workoutId.equals(user.getCurrentWorkoutId())) {
            advanceCurrentWorkout(userId, workoutId);
        }

        workoutRepository.delete("id", workoutId);
    }

    public void reorderWorkouts(UUID userId, List<UUID> workoutIds) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
        List<Workout> owned = workoutRepository.findByUser(user);
        List<WorkoutShare> shared = workoutShareRepository.findBySharedWithUser(user);

        Set<UUID> allIds = new HashSet<>();
        owned.forEach(w -> allIds.add(w.getId()));
        shared.forEach(s -> allIds.add(s.getWorkout().getId()));

        if (!allIds.equals(new HashSet<>(workoutIds)) || workoutIds.size() != allIds.size()) {
            throw new BadRequestException("workoutIds must match exactly the user's workouts");
        }

        for (int i = 0; i < workoutIds.size(); i++) {
            UUID id = workoutIds.get(i);
            Optional<Workout> wOpt = owned.stream().filter(o -> o.getId().equals(id)).findFirst();
            if (wOpt.isPresent()) {
                Workout w = wOpt.get();
                w.setPosition(i);
                workoutRepository.persist(w);
            } else {
                WorkoutShare s = shared.stream().filter(sh -> sh.getWorkout().getId().equals(id)).findFirst().get();
                s.setPosition(i);
                // Note: using Entity Manager persist/merge through repository might be needed, let's just use persist.
                workoutShareRepository.persist(s);
            }
        }
    }

    public void advanceCurrentWorkout(UUID userId, UUID completedWorkoutId) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
        List<WorkoutResponse> ordered = getUnifiedUserWorkouts(user);
        List<WorkoutResponse> remaining = ordered.stream()
            .filter(w -> !w.getId().equals(completedWorkoutId))
            .collect(Collectors.toList());

        if (remaining.isEmpty()) {
            user.setCurrentWorkoutId(null);
        } else {
            int currentIndex = -1;
            for (int i = 0; i < ordered.size(); i++) {
                if (ordered.get(i).getId().equals(completedWorkoutId)) {
                    currentIndex = i;
                    break;
                }
            }
            int nextIndex = currentIndex + 1;
            if (nextIndex >= ordered.size()) nextIndex = 0;
            WorkoutResponse next = ordered.get(nextIndex);
            if (next.getId().equals(completedWorkoutId)) {
                next = remaining.get(0);
            }
            user.setCurrentWorkoutId(next.getId());
        }
    }

    public List<WorkoutResponse> getPublicWorkouts() {
        return workoutRepository.findPublicWorkouts().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ImportAnalyzeResultItem> analyzeImport(UUID userId, ImportAnalyzeRequest request) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
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

    public ImportResultResponse confirmImport(UUID userId, List<ImportConfirmItem> items) {
        User user = userRepository.find("id", userId).firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
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
        long count = workoutRepository.countByUser(user);
        Workout workout = new Workout();
        workout.setName(item.getName());
        workout.setUser(user);
        workout.setIsPublic(false);
        workout.setPosition((int) count);
        workoutRepository.persist(workout);
        if (count == 0) {
            user.setCurrentWorkoutId(workout.getId());
            userRepository.persist(user);
        }
        for (ExerciseImportItem ex : item.getExercises()) {
            Exercise exercise = new Exercise();
            exercise.setName(ex.getName());
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
            workout.getUser().getName(),
            workout.getIsPublic(),
            workout.getCreatedAt(),
            workout.getUpdatedAt()
        );
    }

}
