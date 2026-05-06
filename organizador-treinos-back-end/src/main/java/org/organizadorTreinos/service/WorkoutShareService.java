package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutShare;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

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

    public void shareWorkout(UUID workoutId, String targetUserEmail,
                            WorkoutShare.Permission permission, User currentUser) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        if (!workout.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the workout owner can share it");
        }

        User targetUser = userRepository.findByEmail(targetUserEmail)
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (targetUser.getId().equals(currentUser.getId())) {
            throw new BadRequestException("Cannot share with yourself");
        }

        // Check if already shared
        if (workoutShareRepository.isSharedWith(workout, targetUser)) {
            throw new BadRequestException("Workout already shared with this user");
        }

        WorkoutShare share = new WorkoutShare();
        share.setWorkout(workout);
        share.setSharedWithUser(targetUser);
        share.setPermission(permission);

        workoutShareRepository.persist(share);
    }

    public void revokeShare(UUID workoutId, UUID targetUserId, User currentUser) {
        Workout workout = workoutRepository.find("id", workoutId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("Workout not found"));

        if (!workout.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the workout owner can revoke shares");
        }

        User targetUser = userRepository.find("id", targetUserId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        workoutShareRepository.deleteByWorkoutAndUser(workout, targetUser);
    }
}
