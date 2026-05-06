package org.organizadorTreinos.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("WorkoutRepository Tests")
class WorkoutRepositoryTest {

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    UserRepository userRepository;

    private User testUser;
    private Workout testWorkout;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("hash");
        userRepository.persist(testUser);

        // Create test workout
        testWorkout = new Workout();
        testWorkout.setName("Treino Perna");
        testWorkout.setUser(testUser);
        testWorkout.setIsPublic(false);
    }

    @Test
    @DisplayName("Should save and find workout by ID")
    void testSaveAndFindById() {
        // Act
        workoutRepository.persist(testWorkout);
        Optional<Workout> found = workoutRepository.find("id", testWorkout.getId().toString()).firstResultOptional();

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Treino Perna", found.get().getName());
    }

    @Test
    @DisplayName("Should find workouts by user")
    void testFindByUser() {
        // Arrange
        workoutRepository.persist(testWorkout);

        Workout workout2 = new Workout();
        workout2.setName("Treino Peito");
        workout2.setUser(testUser);
        workout2.setIsPublic(false);
        workoutRepository.persist(workout2);

        // Act
        List<Workout> workouts = workoutRepository.findByUser(testUser);

        // Assert
        assertEquals(2, workouts.size());
    }

    @Test
    @DisplayName("Should find workout by ID and user")
    void testFindByIdAndUser() {
        // Arrange
        workoutRepository.persist(testWorkout);

        // Act
        Optional<Workout> found = workoutRepository.find("id = ?1 and user = ?2", testWorkout.getId().toString(), testUser).firstResultOptional();

        // Assert
        assertTrue(found.isPresent());
    }

    @Test
    @DisplayName("Should return empty when workout belongs to different user")
    void testFindByIdAndUserNotFound() {
        // Arrange
        workoutRepository.persist(testWorkout);
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setPasswordHash("hash");
        userRepository.persist(otherUser);

        // Act
        Optional<Workout> found = workoutRepository.find("id = ?1 and user = ?2", testWorkout.getId().toString(), otherUser).firstResultOptional();

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Should find public workouts")
    void testFindPublicWorkouts() {
        // Arrange
        testWorkout.setIsPublic(true);
        workoutRepository.persist(testWorkout);

        Workout privateWorkout = new Workout();
        privateWorkout.setName("Treino Privado");
        privateWorkout.setUser(testUser);
        privateWorkout.setIsPublic(false);
        workoutRepository.persist(privateWorkout);

        // Act
        List<Workout> publicWorkouts = workoutRepository.findPublicWorkouts();

        // Assert
        assertEquals(1, publicWorkouts.size());
        assertEquals("Treino Perna", publicWorkouts.get(0).getName());
    }

    @Test
    @DisplayName("Should delete workout by ID and user")
    void testDeleteByIdAndUser() {
        // Arrange
        workoutRepository.persist(testWorkout);

        // Act
        workoutRepository.delete("id = ?1 and user = ?2", testWorkout.getId().toString(), testUser);
        Optional<Workout> deleted = workoutRepository.find("id", testWorkout.getId().toString()).firstResultOptional();

        // Assert
        assertFalse(deleted.isPresent());
    }

    @Test
    @DisplayName("Should cascade delete workout when user is deleted")
    void testCascadeDelete() {
        // Arrange
        workoutRepository.persist(testWorkout);

        // Act
        userRepository.delete("id", testUser.getId().toString());
        Optional<Workout> deleted = workoutRepository.find("id", testWorkout.getId().toString()).firstResultOptional();

        // Assert
        assertFalse(deleted.isPresent());
    }
}
