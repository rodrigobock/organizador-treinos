package org.organizadorTreinos.integration;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.CreateExerciseRequest;
import org.organizadorTreinos.dto.request.CreateWorkoutRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.service.AuthService;
import org.organizadorTreinos.service.ExerciseService;
import org.organizadorTreinos.service.WorkoutService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("Workout Complete Flow Integration Test")
class WorkoutFlowIntegrationTest {

    @Inject
    AuthService authService;

    @Inject
    WorkoutService workoutService;

    @Inject
    ExerciseService exerciseService;

    @Inject
    org.organizadorTreinos.service.WorkoutSessionService sessionService;

    @Inject
    UserRepository userRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    ExerciseRepository exerciseRepository;

    @BeforeEach
    @jakarta.transaction.Transactional
    void setUp() {
        exerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Complete flow: Signup → Login → Create Workout → Add Exercise → Toggle Complete")
    void testCompleteWorkoutFlow() {
        // 1. SIGNUP
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("João Silva");
        signupRequest.setEmail("joao@test.com");
        signupRequest.setPassword("Password123");

        AuthResponse signupResponse = authService.signup(signupRequest, "pt-BR");
        assertNotNull(signupResponse.getToken());
        User user = userRepository.findByEmail("joao@test.com").orElseThrow();

        // 2. LOGIN
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("joao@test.com");
        loginRequest.setPassword("Password123");

        AuthResponse loginResponse = authService.login(loginRequest);
        assertNotNull(loginResponse.getToken());
        assertEquals("joao@test.com", loginResponse.getUser().getEmail());

        // 3. CREATE WORKOUT
        CreateWorkoutRequest workoutRequest = new CreateWorkoutRequest();
        workoutRequest.setName("Treino Perna");
        workoutRequest.setIsPublic(false);

        WorkoutResponse workoutResponse = workoutService.createWorkout(user.getId(), workoutRequest);
        assertNotNull(workoutResponse.getId());
        assertEquals("Treino Perna", workoutResponse.getName());

        // 4. ADD EXERCISES
        CreateExerciseRequest exerciseRequest1 = new CreateExerciseRequest();
        exerciseRequest1.setName("Agachamento");

        ExerciseResponse exerciseResponse1 = exerciseService.createExercise(
            workoutResponse.getId(), user, exerciseRequest1);
        assertNotNull(exerciseResponse1.getId());
        assertFalse(exerciseResponse1.getCompleted());

        CreateExerciseRequest exerciseRequest2 = new CreateExerciseRequest();
        exerciseRequest2.setName("Leg Press");

        ExerciseResponse exerciseResponse2 = exerciseService.createExercise(
            workoutResponse.getId(), user, exerciseRequest2);
        assertNotNull(exerciseResponse2.getId());

        // 5. VERIFY WORKOUT HAS EXERCISES
        WorkoutResponse fullWorkout = workoutService.getWorkout(workoutResponse.getId(), user);
        assertNotNull(fullWorkout.getExercises());

        // 6. TOGGLE EXERCISE COMPLETION
        ExerciseResponse toggledExercise = exerciseService.toggleExerciseCompletion(
            workoutResponse.getId(), exerciseResponse1.getId(), user);
        assertTrue(toggledExercise.getCompleted());

        // 7. TOGGLE BACK
        ExerciseResponse toggledBack = exerciseService.toggleExerciseCompletion(
            workoutResponse.getId(), exerciseResponse1.getId(), user);
        assertFalse(toggledBack.getCompleted());

        // 8. DELETE EXERCISE
        exerciseService.deleteExercise(workoutResponse.getId(), exerciseResponse1.getId(), user);

        // 9. DELETE WORKOUT
        workoutService.deleteWorkout(workoutResponse.getId(), user.getId());
        assertFalse(workoutRepository.find("id", workoutResponse.getId()).firstResultOptional().isPresent());
    }

    @Test
    @DisplayName("Multiple users should not interfere with each other")
    void testMultipleUsersIsolation() {
        // User 1: Signup and create workout
        SignupRequest signup1 = new SignupRequest();
        signup1.setName("User 1");
        signup1.setEmail("user1@test.com");
        signup1.setPassword("Password123");
        AuthResponse auth1 = authService.signup(signup1, "pt-BR");
        User user1 = userRepository.findByEmail("user1@test.com").orElseThrow();

        CreateWorkoutRequest workout1 = new CreateWorkoutRequest();
        workout1.setName("User 1 Workout");
        WorkoutResponse response1 = workoutService.createWorkout(user1.getId(), workout1);

        // User 2: Signup and create workout
        SignupRequest signup2 = new SignupRequest();
        signup2.setName("User 2");
        signup2.setEmail("user2@test.com");
        signup2.setPassword("Password456");
        AuthResponse auth2 = authService.signup(signup2, "pt-BR");
        User user2 = userRepository.findByEmail("user2@test.com").orElseThrow();

        CreateWorkoutRequest workout2 = new CreateWorkoutRequest();
        workout2.setName("User 2 Workout");
        WorkoutResponse response2 = workoutService.createWorkout(user2.getId(), workout2);

        // Verify each user has only their own workouts
        List<WorkoutResponse> user1Workouts = workoutService.getUserWorkouts(user1);
        List<WorkoutResponse> user2Workouts = workoutService.getUserWorkouts(user2);

        assertEquals(1, user1Workouts.size());
        assertEquals(1, user2Workouts.size());
        assertEquals(response1.getId(), user1Workouts.get(0).getId());
        assertEquals(response2.getId(), user2Workouts.get(0).getId());
    }

    @Test
    @DisplayName("Starting a session should reset all exercise completion status")
    @jakarta.transaction.Transactional
    void testStartSessionResetsExercises() {
        // Setup user
        SignupRequest signup = new SignupRequest();
        signup.setName("Session User");
        signup.setEmail("session@test.com");
        signup.setPassword("Password123");
        authService.signup(signup, "pt-BR");
        User user = userRepository.findByEmail("session@test.com").orElseThrow();

        // Create workout
        CreateWorkoutRequest workoutReq = new CreateWorkoutRequest();
        workoutReq.setName("Workout to Reset");
        WorkoutResponse workout = workoutService.createWorkout(user.getId(), workoutReq);

        // Add exercise
        CreateExerciseRequest exerciseReq = new CreateExerciseRequest();
        exerciseReq.setName("Exercise 1");
        ExerciseResponse exercise = exerciseService.createExercise(workout.getId(), user, exerciseReq);

        // Mark as completed
        exerciseService.toggleExerciseCompletion(workout.getId(), exercise.getId(), user);
        
        // Verify it's completed
        WorkoutResponse beforeSession = workoutService.getWorkout(workout.getId(), user);
        assertTrue(beforeSession.getExercises().get(0).getCompleted());

        // Start session
        sessionService.startSession(workout.getId(), user);

        // Verify it's reset
        WorkoutResponse afterSession = workoutService.getWorkout(workout.getId(), user);
        assertFalse(afterSession.getExercises().get(0).getCompleted());
    }
}
