package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.CreateExerciseRequest;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("ExerciseService Tests")
class ExerciseServiceTest {

    @Inject
    ExerciseService exerciseService;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    UserRepository userRepository;

    private User owner;
    private User other;
    private Workout ownerWorkout;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        // Create owner
        owner = new User();
        owner.setName("Owner");
        owner.setEmail("owner@test.com");
        owner.setPasswordHash("hash");
        userRepository.persist(owner);

        // Create other user
        other = new User();
        other.setName("Other");
        other.setEmail("other@test.com");
        other.setPasswordHash("hash");
        userRepository.persist(other);

        // Create owner's workout
        ownerWorkout = new Workout();
        ownerWorkout.setName("Owner Workout");
        ownerWorkout.setUser(owner);
        ownerWorkout.setIsPublic(false);
        workoutRepository.persist(ownerWorkout);
    }

    @Test
    @DisplayName("Owner should be able to create exercise in own workout")
    void testOwnerCanCreateExercise() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Agachamento");

        // Act
        ExerciseResponse response = exerciseService.createExercise(ownerWorkout.getId(), owner, request);

        // Assert
        assertNotNull(response);
        assertEquals("Agachamento", response.getName());
        assertFalse(response.getCompleted());
    }

    @Test
    @DisplayName("🔥 Non-owner should NOT be able to create exercise")
    void testNonOwnerCannotCreateExercise() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Agachamento");

        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            exerciseService.createExercise(ownerWorkout.getId(), other, request);
        });
    }

    @Test
    @DisplayName("Should reject creating exercise in non-existent workout")
    void testCreateInNonExistentWorkout() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Exercise");

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            exerciseService.createExercise(UUID.randomUUID(), owner, request);
        });
    }

    @Test
    @DisplayName("Owner should be able to update exercise")
    void testOwnerCanUpdateExercise() {
        // Arrange
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setName("Agachamento");
        ExerciseResponse created = exerciseService.createExercise(ownerWorkout.getId(), owner, createRequest);

        CreateExerciseRequest updateRequest = new CreateExerciseRequest();
        updateRequest.setName("Agachamento Atualizado");

        // Act
        ExerciseResponse updated = exerciseService.updateExercise(
            ownerWorkout.getId(), created.getId(), owner, updateRequest);

        // Assert
        assertEquals("Agachamento Atualizado", updated.getName());
    }

    @Test
    @DisplayName("🔥 Non-owner should NOT be able to update exercise")
    void testNonOwnerCannotUpdateExercise() {
        // Arrange
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setName("Exercise");
        ExerciseResponse created = exerciseService.createExercise(ownerWorkout.getId(), owner, createRequest);

        CreateExerciseRequest updateRequest = new CreateExerciseRequest();
        updateRequest.setName("Updated");

        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            exerciseService.updateExercise(ownerWorkout.getId(), created.getId(), other, updateRequest);
        });
    }

    @Test
    @DisplayName("Owner should be able to toggle exercise completion")
    void testOwnerCanToggleCompletion() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Exercise");
        ExerciseResponse created = exerciseService.createExercise(ownerWorkout.getId(), owner, request);
        assertFalse(created.getCompleted());

        // Act
        ExerciseResponse toggled = exerciseService.toggleExerciseCompletion(
            ownerWorkout.getId(), created.getId(), owner);

        // Assert
        assertTrue(toggled.getCompleted());
    }

    @Test
    @DisplayName("Owner should be able to delete exercise")
    void testOwnerCanDeleteExercise() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Exercise");
        ExerciseResponse created = exerciseService.createExercise(ownerWorkout.getId(), owner, request);

        // Act
        exerciseService.deleteExercise(ownerWorkout.getId(), created.getId(), owner);

        // Assert
        assertThrows(NotFoundException.class, () -> {
            exerciseService.deleteExercise(ownerWorkout.getId(), created.getId(), owner);
        });
    }

    @Test
    @DisplayName("🔥 Non-owner should NOT be able to delete exercise")
    void testNonOwnerCannotDeleteExercise() {
        // Arrange
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setName("Exercise");
        ExerciseResponse created = exerciseService.createExercise(ownerWorkout.getId(), owner, request);

        // Act & Assert
        assertThrows(ForbiddenException.class, () -> {
            exerciseService.deleteExercise(ownerWorkout.getId(), created.getId(), other);
        });
    }
}
