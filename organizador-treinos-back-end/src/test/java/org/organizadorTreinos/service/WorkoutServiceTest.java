package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.CreateWorkoutRequest;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("WorkoutService Authorization Tests")
class WorkoutServiceTest {

    @Inject
    WorkoutService workoutService;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    UserRepository userRepository;

    private User user1;
    private User user2;
    private Workout user1Workout;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        // Create two different users
        user1 = new User();
        user1.setName("User 1");
        user1.setEmail("user1@test.com");
        user1.setPasswordHash("hash1");
        userRepository.persist(user1);

        user2 = new User();
        user2.setName("User 2");
        user2.setEmail("user2@test.com");
        user2.setPasswordHash("hash2");
        userRepository.persist(user2);

        // Create workout owned by user1
        user1Workout = new Workout();
        user1Workout.setName("User 1 Workout");
        user1Workout.setUser(user1);
        user1Workout.setIsPublic(false);
        workoutRepository.persist(user1Workout);
    }

    @Test
    @DisplayName("User should be able to create workout")
    void testUserCanCreateWorkout() {
        // Arrange
        CreateWorkoutRequest request = new CreateWorkoutRequest();
        request.setName("Nova Treino");
        request.setIsPublic(false);

        // Act
        WorkoutResponse response = workoutService.createWorkout(user1, request);

        // Assert
        assertNotNull(response);
        assertEquals("Nova Treino", response.getName());
        assertEquals(user1.getId(), response.getUserId());
    }

    @Test
    @DisplayName("User should be able to view own workouts")
    void testUserCanViewOwnWorkouts() {
        // Act
        List<WorkoutResponse> workouts = workoutService.getUserWorkouts(user1);

        // Assert
        assertEquals(1, workouts.size());
        assertEquals(user1Workout.getId(), workouts.get(0).getId());
    }

    @Test
    @DisplayName("🔥 AUTHORIZATION: User A should NOT access User B's private workout")
    void testUserCannotAccessOtherUserWorkout() {
        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            workoutService.getWorkout(user1Workout.getId(), user2);
        });
    }

    @Test
    @DisplayName("User should be able to access own workout")
    void testUserCanAccessOwnWorkout() {
        // Act
        WorkoutResponse response = workoutService.getWorkout(user1Workout.getId(), user1);

        // Assert
        assertNotNull(response);
        assertEquals(user1Workout.getId(), response.getId());
    }

    @Test
    @DisplayName("🔥 AUTHORIZATION: User B should NOT update User A's workout")
    void testUserCannotUpdateOtherUserWorkout() {
        // Arrange
        CreateWorkoutRequest request = new CreateWorkoutRequest();
        request.setName("Updated Name");

        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            workoutService.updateWorkout(user1Workout.getId(), user2, request);
        });
    }

    @Test
    @DisplayName("User should be able to update own workout")
    void testUserCanUpdateOwnWorkout() {
        // Arrange
        CreateWorkoutRequest request = new CreateWorkoutRequest();
        request.setName("Updated Workout");

        // Act
        WorkoutResponse response = workoutService.updateWorkout(user1Workout.getId(), user1, request);

        // Assert
        assertEquals("Updated Workout", response.getName());
    }

    @Test
    @DisplayName("🔥 AUTHORIZATION: User B should NOT delete User A's workout")
    void testUserCannotDeleteOtherUserWorkout() {
        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            workoutService.deleteWorkout(user1Workout.getId(), user2);
        });
    }

    @Test
    @DisplayName("User should be able to delete own workout")
    void testUserCanDeleteOwnWorkout() {
        // Act
        workoutService.deleteWorkout(user1Workout.getId(), user1);

        // Assert
        assertFalse(workoutRepository.find("id", user1Workout.getId()).firstResultOptional().isPresent());
    }

    @Test
    @DisplayName("Public workouts should be accessible to anyone (read-only)")
    void testPublicWorkoutIsAccessible() {
        // Arrange
        user1Workout.setIsPublic(true);
        workoutRepository.persist(user1Workout);

        // Act
        List<WorkoutResponse> publicWorkouts = workoutService.getPublicWorkouts();

        // Assert
        assertEquals(1, publicWorkouts.size());
    }

    @Test
    @DisplayName("Non-existent workout should throw NotFoundException")
    void testGetNonExistentWorkout() {
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            workoutService.getWorkout(java.util.UUID.randomUUID(), user1);
        });
    }
}
