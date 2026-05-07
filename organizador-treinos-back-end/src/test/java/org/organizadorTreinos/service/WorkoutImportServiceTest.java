package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.ExerciseImportItem;
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("WorkoutService Import Tests")
class WorkoutImportServiceTest {

    @Inject WorkoutService workoutService;
    @Inject WorkoutRepository workoutRepository;
    @Inject ExerciseRepository exerciseRepository;
    @Inject UserRepository userRepository;

    private User user;
    private User otherUser;
    private Workout existingWorkout;

    @BeforeEach
    @Transactional
    void setUp() {
        exerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setName("Test User");
        user.setEmail("test@test.com");
        user.setPasswordHash("hash");
        userRepository.persist(user);

        otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setPasswordHash("hash");
        userRepository.persist(otherUser);

        existingWorkout = new Workout();
        existingWorkout.setName("Push Day");
        existingWorkout.setUser(user);
        existingWorkout.setIsPublic(false);
        workoutRepository.persist(existingWorkout);

        for (String name : List.of("Bench Press", "Shoulder Press", "Squat")) {
            Exercise ex = new Exercise();
            ex.setName(name);
            ex.setCompleted(false);
            ex.setWorkout(existingWorkout);
            exerciseRepository.persist(ex);
        }
    }

    private ImportWorkoutItem item(String name, String... exercises) {
        ImportWorkoutItem item = new ImportWorkoutItem();
        item.setName(name);
        item.setExercises(Arrays.stream(exercises).map(n -> {
            ExerciseImportItem e = new ExerciseImportItem();
            e.setName(n);
            e.setCompleted(false);
            return e;
        }).toList());
        return item;
    }

    // --- analyzeImport ---

    @Test
    @DisplayName("No name match → clean")
    void analyzeImport_noNameMatch_returnsClean() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("Leg Day", "Squat", "Leg Press")));
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user.getId(), req);
        assertEquals(1, results.size());
        assertEquals("clean", results.get(0).getStatus());
        assertNull(results.get(0).getConflictId());
    }

    @Test
    @DisplayName("Name match + similarity >= 0.75 → duplicate")
    void analyzeImport_highSimilarity_returnsDuplicate() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("Push Day", "Bench Press", "Shoulder Press", "Squat")));
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user.getId(), req);
        assertEquals("duplicate", results.get(0).getStatus());
        assertEquals(existingWorkout.getId(), results.get(0).getConflictId());
        assertTrue(results.get(0).getSimilarity() >= 0.75);
    }

    @Test
    @DisplayName("Name match + similarity < 0.75 → clean")
    void analyzeImport_lowSimilarity_returnsClean() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("Push Day", "Bicep Curl", "Tricep Pushdown")));
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user.getId(), req);
        assertEquals("clean", results.get(0).getStatus());
    }

    @Test
    @DisplayName("Name match is case-insensitive")
    void analyzeImport_caseInsensitive_returnsDuplicate() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("push day", "Bench Press", "Shoulder Press", "Squat")));
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user.getId(), req);
        assertEquals("duplicate", results.get(0).getStatus());
    }

    @Test
    @DisplayName("Multiple workouts analyzed independently")
    void analyzeImport_multiple_analyzedIndependently() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(
            item("Push Day", "Bench Press", "Shoulder Press", "Squat"),
            item("Leg Day", "Squat", "Leg Press")
        ));
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user.getId(), req);
        assertEquals(2, results.size());
        assertEquals("duplicate", results.get(0).getStatus());
        assertEquals("clean", results.get(1).getStatus());
    }

    // --- confirmImport ---

    @Test
    @DisplayName("action=create → new workout and exercises created")
    void confirmImport_create_createsWorkout() {
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item("New Workout", "Deadlift", "Pull Up"));
        confirmItem.setAction("create");

        ImportResultResponse result = workoutService.confirmImport(user.getId(), List.of(confirmItem));

        assertEquals(1, result.getCreated());
        assertEquals(0, result.getReplaced());
        assertEquals(0, result.getSkipped());

        Workout created = workoutRepository.findByUser(user).stream()
            .filter(w -> w.getName().equals("New Workout")).findFirst().orElseThrow();
        List<Exercise> exercises = exerciseRepository.findByWorkout(created);
        assertEquals(2, exercises.size());
        assertTrue(exercises.stream().anyMatch(e -> e.getName().equals("Deadlift")));
    }

    @Test
    @DisplayName("action=replace → existing workout exercises replaced")
    void confirmImport_replace_replacesExercises() {
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item("Push Day", "Romanian Deadlift"));
        confirmItem.setAction("replace");
        confirmItem.setConflictId(existingWorkout.getId());

        ImportResultResponse result = workoutService.confirmImport(user.getId(), List.of(confirmItem));

        assertEquals(1, result.getReplaced());
        List<Exercise> exercises = exerciseRepository.findByWorkout(existingWorkout);
        assertEquals(1, exercises.size());
        assertEquals("Romanian Deadlift", exercises.get(0).getName());
    }

    @Test
    @DisplayName("action=skip → no changes")
    void confirmImport_skip_noChanges() {
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item("Push Day", "Bench Press"));
        confirmItem.setAction("skip");
        confirmItem.setConflictId(existingWorkout.getId());

        ImportResultResponse result = workoutService.confirmImport(user.getId(), List.of(confirmItem));

        assertEquals(1, result.getSkipped());
        assertEquals(3, exerciseRepository.findByWorkout(existingWorkout).size());
    }

    @Test
    @DisplayName("action=replace with wrong user → ForbiddenException")
    void confirmImport_replaceWrongUser_throwsForbidden() {
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item("Push Day", "Squat"));
        confirmItem.setAction("replace");
        confirmItem.setConflictId(existingWorkout.getId());

        assertThrows(ForbiddenException.class,
            () -> workoutService.confirmImport(otherUser.getId(), List.of(confirmItem)));
    }
}
