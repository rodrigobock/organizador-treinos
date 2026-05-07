package org.organizadorTreinos.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("ExerciseRepository Tests")
class ExerciseRepositoryTest {

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    UserRepository userRepository;

    private User testUser;
    private Workout testWorkout;
    private Exercise testExercise;

    @BeforeEach
    void setUp() {
        exerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        // Create user and workout
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("hash");
        userRepository.persist(testUser);

        testWorkout = new Workout();
        testWorkout.setName("Treino Teste");
        testWorkout.setUser(testUser);
        testWorkout.setIsPublic(false);
        workoutRepository.persist(testWorkout);

        // Create test exercise
        testExercise = new Exercise();
        testExercise.setName("Agachamento");
        testExercise.setWorkout(testWorkout);
    }

    @Test
    @DisplayName("Should save and find exercise by ID")
    void testSaveAndFindById() {
        // Act
        exerciseRepository.persist(testExercise);
        Optional<Exercise> found = exerciseRepository.find("id", testExercise.getId().toString()).firstResultOptional();

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Agachamento", found.get().getName());
    }

    @Test
    @DisplayName("Should find exercises by workout")
    void testFindByWorkout() {
        // Arrange
        exerciseRepository.persist(testExercise);

        Exercise exercise2 = new Exercise();
        exercise2.setName("Leg Press");
        exercise2.setWorkout(testWorkout);
        exerciseRepository.persist(exercise2);

        // Act
        List<Exercise> exercises = exerciseRepository.findByWorkout(testWorkout);

        // Assert
        assertEquals(2, exercises.size());
    }

    @Test
    @DisplayName("Should find exercise by ID and workout")
    void testFindByIdAndWorkout() {
        // Arrange
        exerciseRepository.persist(testExercise);

        // Act
        Optional<Exercise> found = exerciseRepository.findByIdAndWorkout(testExercise.getId(), testWorkout);

        // Assert
        assertTrue(found.isPresent());
    }

    @Test
    @DisplayName("Should return empty when exercise belongs to different workout")
    void testFindByIdAndWorkoutNotFound() {
        // Arrange
        exerciseRepository.persist(testExercise);
        Workout otherWorkout = new Workout();
        otherWorkout.setName("Other Workout");
        otherWorkout.setUser(testUser);
        otherWorkout.setIsPublic(false);
        workoutRepository.persist(otherWorkout);

        // Act
        Optional<Exercise> found = exerciseRepository.findByIdAndWorkout(testExercise.getId(), otherWorkout);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Should cascade delete exercises when workout is deleted")
    void testCascadeDelete() {
        // Arrange
        exerciseRepository.persist(testExercise);

        // Act
        workoutRepository.delete("id", testWorkout.getId().toString());
        Optional<Exercise> deleted = exerciseRepository.find("id", testExercise.getId()).firstResultOptional();

        // Assert
        assertFalse(deleted.isPresent());
    }

    @Test
    @DisplayName("Should delete exercise by ID and workout")
    void testDeleteByIdAndWorkout() {
        // Arrange
        exerciseRepository.persist(testExercise);

        // Act
        exerciseRepository.delete("id", testExercise.getId().toString());
        Optional<Exercise> deleted = exerciseRepository.find("id", testExercise.getId()).firstResultOptional();

        // Assert
        assertFalse(deleted.isPresent());
    }
}
