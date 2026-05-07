package org.organizadorTreinos.integration;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.CreateWorkoutRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.service.AuthService;
import org.organizadorTreinos.service.UserService;
import org.organizadorTreinos.service.WorkoutService;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("User Delete Account Flow Integration Test")
class UserDeleteFlowIntegrationTest {

    @Inject
    AuthService authService;

    @Inject
    UserService userService;

    @Inject
    WorkoutService workoutService;

    @Inject
    UserRepository userRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    ExerciseRepository exerciseRepository;

    @BeforeEach
    void setUp() {
        exerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Delete user with valid password cascades to workouts and exercises")
    void testDeleteUserWithCascade() {
        // 1. SIGNUP
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Maria Silva");
        signupRequest.setEmail("maria@test.com");
        signupRequest.setPassword("Password123");

        AuthResponse signupResponse = authService.signup(signupRequest);
        assertNotNull(signupResponse.getToken());

        User user = userRepository.findByEmail("maria@test.com").orElseThrow();
        var userId = user.getId();

        // 2. CREATE WORKOUT
        CreateWorkoutRequest workoutRequest = new CreateWorkoutRequest();
        workoutRequest.setName("Treino Peito");
        workoutRequest.setIsPublic(false);

        WorkoutResponse workoutResponse = workoutService.createWorkout(user, workoutRequest);
        assertNotNull(workoutResponse.getId());

        // 3. Verify workout exists
        var workout = workoutRepository.find("id", workoutResponse.getId())
            .firstResultOptional();
        assertTrue(workout.isPresent());

        // 4. DELETE USER with correct password
        userService.deleteUser(userId, "Password123");

        // 5. Verify user is deleted
        var deletedUser = userRepository.find("id", userId).firstResultOptional();
        assertFalse(deletedUser.isPresent());

        // 6. Verify workout is also deleted (cascade)
        var deletedWorkout = workoutRepository.find("id", workoutResponse.getId())
            .firstResultOptional();
        assertFalse(deletedWorkout.isPresent());
    }

    @Test
    @DisplayName("Delete user with invalid password fails")
    void testDeleteUserWithInvalidPassword() {
        // 1. SIGNUP
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Pedro Silva");
        signupRequest.setEmail("pedro@test.com");
        signupRequest.setPassword("Password123");

        AuthResponse signupResponse = authService.signup(signupRequest);
        assertNotNull(signupResponse.getToken());

        User user = userRepository.findByEmail("pedro@test.com").orElseThrow();
        var userId = user.getId();

        // 2. Try to delete with wrong password
        assertThrows(jakarta.ws.rs.BadRequestException.class, () -> {
            userService.deleteUser(userId, "WrongPassword");
        });

        // 3. Verify user still exists
        var stillExists = userRepository.find("id", userId).firstResultOptional();
        assertTrue(stillExists.isPresent());
    }
}
