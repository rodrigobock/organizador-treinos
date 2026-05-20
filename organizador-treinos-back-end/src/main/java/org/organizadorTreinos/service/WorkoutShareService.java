package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.response.BulkShareResult;
import org.organizadorTreinos.dto.response.SharedByMeResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutShare;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class WorkoutShareService {

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    WorkoutShareRepository workoutShareRepository;

    @Inject
    UserRepository userRepository;

    /**
     * Share a single workout with one user (legacy — kept for backward compat).
     */
    public void shareWorkout(UUID workoutId, String targetUserEmail,
                             WorkoutShare.Permission permission, User currentUser) {
        Workout workout = findWorkoutOwnedBy(workoutId, currentUser);

        User targetUser = userRepository.findByEmail(targetUserEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (targetUser.getId().equals(currentUser.getId())) {
            throw new BadRequestException("Cannot share with yourself");
        }

        if (workoutShareRepository.isSharedWith(workout, targetUser)) {
            throw new BadRequestException("Workout already shared with this user");
        }

        persist(workout, targetUser, permission);
    }

    /**
     * Share a workout with multiple users at once.
     * Returns counts of successful shares, already-shared entries and unknown emails.
     */
    public BulkShareResult shareWithMultiple(UUID workoutId, List<String> emails,
                                              WorkoutShare.Permission permission, User currentUser) {
        Workout workout = findWorkoutOwnedBy(workoutId, currentUser);

        int shared = 0;
        int alreadyShared = 0;
        List<String> notFound = new ArrayList<>();

        for (String email : emails) {
            String trimmed = email.trim().toLowerCase();
            if (trimmed.isEmpty()) continue;

            if (trimmed.equalsIgnoreCase(currentUser.getEmail())) {
                // silently skip self
                continue;
            }

            Optional<User> targetOpt = userRepository.findByEmail(trimmed);
            if (targetOpt.isEmpty()) {
                notFound.add(trimmed);
                continue;
            }

            User target = targetOpt.get();
            if (workoutShareRepository.isSharedWith(workout, target)) {
                alreadyShared++;
                continue;
            }

            persist(workout, target, permission);
            shared++;
        }

        return new BulkShareResult(shared, alreadyShared, notFound);
    }

    /**
     * Revoke access for a specific user on a workout owned by currentUser.
     */
    public void revokeAccess(UUID workoutId, UUID targetUserId, User currentUser) {
        Workout workout = findWorkoutOwnedBy(workoutId, currentUser);

        User targetUser = userRepository.find("id", targetUserId)
                .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        workoutShareRepository.deleteByWorkoutAndUser(workout, targetUser);
    }

    /**
     * List workouts shared by currentUser along with details of each share.
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<SharedByMeResponse> getSharedByMe(User currentUser) {
        List<WorkoutShare> shares = workoutShareRepository.findByWorkoutOwner(currentUser);

        // Group by workout, preserving insertion order
        Map<UUID, SharedByMeResponse> byWorkout = new LinkedHashMap<>();

        for (WorkoutShare share : shares) {
            Workout workout = share.getWorkout();
            UUID workoutId = workout.getId();

            byWorkout.computeIfAbsent(workoutId,
                    id -> new SharedByMeResponse(id, workout.getName(), new ArrayList<>()));

            User sharedWith = share.getSharedWithUser();
            SharedByMeResponse.ShareEntry entry = new SharedByMeResponse.ShareEntry(
                    sharedWith.getId(),
                    sharedWith.getEmail(),
                    sharedWith.getName(),
                    share.getPermission(),
                    share.getCreatedAt(),
                    share.getLastAccessedAt()
            );

            byWorkout.get(workoutId).getShares().add(entry);
        }

        return new ArrayList<>(byWorkout.values());
    }

    /**
     * Update last_accessed_at for a share record when a non-owner accesses the workout.
     * No-op if there is no share record (public workout access, etc.).
     */
    public void recordAccess(Workout workout, User user) {
        workoutShareRepository.findByWorkoutAndUser(workout, user).ifPresent(share -> {
            share.setLastAccessedAt(LocalDateTime.now());
            workoutShareRepository.persist(share);
        });
    }

    // ---- legacy method name kept so existing callers still compile ----

    public void revokeShare(UUID workoutId, UUID targetUserId, User currentUser) {
        revokeAccess(workoutId, targetUserId, currentUser);
    }

    // ---- helpers ----

    private Workout findWorkoutOwnedBy(UUID workoutId, User owner) {
        Workout workout = workoutRepository.find("id", workoutId)
                .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        if (!workout.getUser().getId().equals(owner.getId())) {
            throw new ForbiddenException("Only the workout owner can manage shares");
        }

        return workout;
    }

    private void persist(Workout workout, User target, WorkoutShare.Permission permission) {
        WorkoutShare share = new WorkoutShare();
        share.setWorkout(workout);
        share.setSharedWithUser(target);
        share.setPermission(permission);
        workoutShareRepository.persist(share);
    }
}
