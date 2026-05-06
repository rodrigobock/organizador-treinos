package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutShare;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutShareRepository;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("WorkoutShareService Tests")
class WorkoutShareServiceTest {

    @Inject
    WorkoutShareService workoutShareService;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    WorkoutShareRepository shareRepository;

    private User owner;
    private User targetUser;
    private Workout ownerWorkout;

    @BeforeEach
    void setUp() {
        shareRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        // Create owner and target user
        owner = new User();
        owner.setName("Owner");
        owner.setEmail("owner@test.com");
        owner.setPasswordHash("hash");
        userRepository.persist(owner);

        targetUser = new User();
        targetUser.setName("Target");
        targetUser.setEmail("target@test.com");
        targetUser.setPasswordHash("hash");
        userRepository.persist(targetUser);

        // Create owner's workout
        ownerWorkout = new Workout();
        ownerWorkout.setName("Owner Workout");
        ownerWorkout.setUser(owner);
        ownerWorkout.setIsPublic(false);
        workoutRepository.persist(ownerWorkout);
    }

    @Test
    @DisplayName("Owner should be able to share workout with READ permission")
    void testShareWorkoutReadPermission() {
        // Act
        workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
            WorkoutShare.Permission.READ, owner);

        // Assert
        assertTrue(shareRepository.isSharedWith(ownerWorkout, targetUser));
    }

    @Test
    @DisplayName("Owner should be able to share workout with EDIT permission")
    void testShareWorkoutEditPermission() {
        // Act
        workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
            WorkoutShare.Permission.EDIT, owner);

        // Assert
        assertTrue(shareRepository.isSharedWith(ownerWorkout, targetUser));
    }

    @Test
    @DisplayName("🔥 Non-owner should NOT be able to share workout")
    void testNonOwnerCannotShare() {
        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
                WorkoutShare.Permission.READ, targetUser);
        });
    }

    @Test
    @DisplayName("Should reject sharing with non-existent user")
    void testShareWithNonExistentUser() {
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            workoutShareService.shareWorkout(ownerWorkout.getId(), "nonexistent@test.com",
                WorkoutShare.Permission.READ, owner);
        });
    }

    @Test
    @DisplayName("Should reject sharing workout with self")
    void testCannotShareWithSelf() {
        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            workoutShareService.shareWorkout(ownerWorkout.getId(), owner.getEmail(),
                WorkoutShare.Permission.READ, owner);
        });
    }

    @Test
    @DisplayName("Should reject duplicate shares")
    void testDuplicateShareRejected() {
        // Arrange
        workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
            WorkoutShare.Permission.READ, owner);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
                WorkoutShare.Permission.EDIT, owner);
        });
    }

    @Test
    @DisplayName("Owner should be able to revoke share")
    void testRevokeShare() {
        // Arrange
        workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
            WorkoutShare.Permission.READ, owner);

        // Act
        workoutShareService.revokeShare(ownerWorkout.getId(), targetUser.getId(), owner);

        // Assert
        assertFalse(shareRepository.isSharedWith(ownerWorkout, targetUser));
    }

    @Test
    @DisplayName("🔥 Non-owner should NOT be able to revoke shares")
    void testNonOwnerCannotRevoke() {
        // Arrange
        User otherUser = new User();
        otherUser.setName("Other");
        otherUser.setEmail("other@test.com");
        otherUser.setPasswordHash("hash");
        userRepository.persist(otherUser);

        workoutShareService.shareWorkout(ownerWorkout.getId(), targetUser.getEmail(),
            WorkoutShare.Permission.READ, owner);

        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            workoutShareService.revokeShare(ownerWorkout.getId(), targetUser.getId(), otherUser);
        });
    }
}
