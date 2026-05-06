# Workout JSON Export/Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JSON export (single + all workouts) and JSON import (with fuzzy duplicate detection and conflict resolution) to the workout organizer.

**Architecture:** Frontend assembles export JSON from existing API data (no new backend endpoints for export). Import uses two new backend endpoints: `/workouts/import/analyze` (fuzzy duplicate check) and `/workouts/import/confirm` (execute with user decisions). Duplicate detection uses case-insensitive Jaccard similarity on exercise names, threshold ≥ 0.75.

**Tech Stack:** Quarkus 3.9.1 (JAX-RS, Panache), Java 17, JUnit5 + `@QuarkusTest`, React 18, React Bootstrap 5, Axios.

---

## File Map

**Backend — new files:**
- `src/main/java/org/organizadorTreinos/dto/request/ExerciseImportItem.java`
- `src/main/java/org/organizadorTreinos/dto/request/ImportWorkoutItem.java`
- `src/main/java/org/organizadorTreinos/dto/request/ImportAnalyzeRequest.java`
- `src/main/java/org/organizadorTreinos/dto/request/ImportConfirmItem.java`
- `src/main/java/org/organizadorTreinos/dto/response/ImportAnalyzeResultItem.java`
- `src/main/java/org/organizadorTreinos/dto/response/ImportResultResponse.java`
- `src/test/java/org/organizadorTreinos/service/WorkoutImportServiceTest.java`

**Backend — modified files:**
- `src/main/java/org/organizadorTreinos/service/WorkoutService.java` — add `analyzeImport()`, `confirmImport()`, private helpers
- `src/main/java/org/organizadorTreinos/controller/WorkoutController.java` — add 2 endpoints

**Frontend — new files:**
- `src/utils/downloadJson.js`

**Frontend — modified files:**
- `src/services/workoutService.js` — add `analyzeImport()`, `confirmImport()`
- `src/pages/WorkoutDetail/index.js` — add export button
- `src/pages/MyWorkouts/index.js` — add export-all button + import UI + conflict modal

---

## Task 1: Backend Import/Export DTOs

**Files:**
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ExerciseImportItem.java`
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportWorkoutItem.java`
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportAnalyzeRequest.java`
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportConfirmItem.java`
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/response/ImportAnalyzeResultItem.java`
- Create: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/response/ImportResultResponse.java`

- [ ] **Step 1: Create ExerciseImportItem.java**

```java
package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ExerciseImportItem {

    @NotBlank(message = "Exercise name is required")
    private String name;

    private Boolean completed = false;

    public ExerciseImportItem() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}
```

- [ ] **Step 2: Create ImportWorkoutItem.java**

```java
package org.organizadorTreinos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ImportWorkoutItem {

    @NotBlank(message = "Workout name is required")
    private String name;

    @NotNull
    @Valid
    private List<ExerciseImportItem> exercises;

    public ImportWorkoutItem() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<ExerciseImportItem> getExercises() { return exercises; }
    public void setExercises(List<ExerciseImportItem> exercises) { this.exercises = exercises; }
}
```

- [ ] **Step 3: Create ImportAnalyzeRequest.java**

```java
package org.organizadorTreinos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ImportAnalyzeRequest {

    @NotNull
    @Valid
    private List<ImportWorkoutItem> workouts;

    public ImportAnalyzeRequest() {}

    public List<ImportWorkoutItem> getWorkouts() { return workouts; }
    public void setWorkouts(List<ImportWorkoutItem> workouts) { this.workouts = workouts; }
}
```

- [ ] **Step 4: Create ImportConfirmItem.java**

```java
package org.organizadorTreinos.dto.request;

import java.util.UUID;

public class ImportConfirmItem {

    private ImportWorkoutItem workout;
    private String action; // "create" | "replace" | "skip"
    private UUID conflictId;

    public ImportConfirmItem() {}

    public ImportWorkoutItem getWorkout() { return workout; }
    public void setWorkout(ImportWorkoutItem workout) { this.workout = workout; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public UUID getConflictId() { return conflictId; }
    public void setConflictId(UUID conflictId) { this.conflictId = conflictId; }
}
```

- [ ] **Step 5: Create ImportAnalyzeResultItem.java**

```java
package org.organizadorTreinos.dto.response;

import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import java.util.UUID;

public class ImportAnalyzeResultItem {

    private ImportWorkoutItem workout;
    private String status; // "clean" | "duplicate"
    private UUID conflictId;
    private Double similarity;

    public ImportAnalyzeResultItem() {}

    public ImportAnalyzeResultItem(ImportWorkoutItem workout, String status,
                                   UUID conflictId, Double similarity) {
        this.workout = workout;
        this.status = status;
        this.conflictId = conflictId;
        this.similarity = similarity;
    }

    public ImportWorkoutItem getWorkout() { return workout; }
    public void setWorkout(ImportWorkoutItem workout) { this.workout = workout; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getConflictId() { return conflictId; }
    public void setConflictId(UUID conflictId) { this.conflictId = conflictId; }

    public Double getSimilarity() { return similarity; }
    public void setSimilarity(Double similarity) { this.similarity = similarity; }
}
```

- [ ] **Step 6: Create ImportResultResponse.java**

```java
package org.organizadorTreinos.dto.response;

public class ImportResultResponse {

    private int created;
    private int replaced;
    private int skipped;

    public ImportResultResponse() {}

    public ImportResultResponse(int created, int replaced, int skipped) {
        this.created = created;
        this.replaced = replaced;
        this.skipped = skipped;
    }

    public int getCreated() { return created; }
    public void setCreated(int created) { this.created = created; }

    public int getReplaced() { return replaced; }
    public void setReplaced(int replaced) { this.replaced = replaced; }

    public int getSkipped() { return skipped; }
    public void setSkipped(int skipped) { this.skipped = skipped; }
}
```

- [ ] **Step 7: Compile check**

Run from `organizador-treinos-back-end/`:
```bash
mvn compile -q
```
Expected: BUILD SUCCESS, no errors.

- [ ] **Step 8: Commit**

```bash
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ExerciseImportItem.java
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportWorkoutItem.java
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportAnalyzeRequest.java
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ImportConfirmItem.java
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/response/ImportAnalyzeResultItem.java
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/response/ImportResultResponse.java
git commit -m "feat: add import/export DTOs for workout JSON feature"
```

---

## Task 2: WorkoutService.analyzeImport() — TDD

**Files:**
- Create: `organizador-treinos-back-end/src/test/java/org/organizadorTreinos/service/WorkoutImportServiceTest.java`
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutService.java`

- [ ] **Step 1: Write failing tests for analyzeImport**

Create `WorkoutImportServiceTest.java`:

```java
package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.ExerciseImportItem;
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("WorkoutService Import Analysis Tests")
class WorkoutImportServiceTest {

    @Inject WorkoutService workoutService;
    @Inject WorkoutRepository workoutRepository;
    @Inject ExerciseRepository exerciseRepository;
    @Inject UserRepository userRepository;

    private User user;
    private Workout existingWorkout;

    @BeforeEach
    void setUp() {
        exerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setName("Test User");
        user.setEmail("test@test.com");
        user.setPasswordHash("hash");
        userRepository.persist(user);

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
        item.setExercises(java.util.Arrays.stream(exercises).map(n -> {
            ExerciseImportItem e = new ExerciseImportItem();
            e.setName(n);
            e.setCompleted(false);
            return e;
        }).toList());
        return item;
    }

    @Test
    @DisplayName("No name match → clean")
    void analyzeImport_noNameMatch_returnsClean() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("Leg Day", "Squat", "Leg Press")));

        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, req);

        assertEquals(1, results.size());
        assertEquals("clean", results.get(0).getStatus());
        assertNull(results.get(0).getConflictId());
    }

    @Test
    @DisplayName("Name match + similarity >= 0.75 → duplicate")
    void analyzeImport_nameMatchHighSimilarity_returnsDuplicate() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        // 3 of 3 matching = 1.0 similarity
        req.setWorkouts(List.of(item("Push Day", "Bench Press", "Shoulder Press", "Squat")));

        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, req);

        assertEquals(1, results.size());
        assertEquals("duplicate", results.get(0).getStatus());
        assertEquals(existingWorkout.getId(), results.get(0).getConflictId());
        assertNotNull(results.get(0).getSimilarity());
        assertTrue(results.get(0).getSimilarity() >= 0.75);
    }

    @Test
    @DisplayName("Name match + similarity < 0.75 → clean")
    void analyzeImport_nameMatchLowSimilarity_returnsClean() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        // 0 matching exercises out of 5 total = 0.0 similarity
        req.setWorkouts(List.of(item("Push Day", "Bicep Curl", "Tricep Pushdown")));

        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, req);

        assertEquals(1, results.size());
        assertEquals("clean", results.get(0).getStatus());
    }

    @Test
    @DisplayName("Name match is case-insensitive")
    void analyzeImport_nameMatchCaseInsensitive_returnsDuplicate() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(item("push day", "Bench Press", "Shoulder Press", "Squat")));

        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, req);

        assertEquals("duplicate", results.get(0).getStatus());
    }

    @Test
    @DisplayName("Multiple workouts analyzed independently")
    void analyzeImport_multipleWorkouts_analyzedIndependently() {
        ImportAnalyzeRequest req = new ImportAnalyzeRequest();
        req.setWorkouts(List.of(
            item("Push Day", "Bench Press", "Shoulder Press", "Squat"),
            item("Leg Day", "Squat", "Leg Press")
        ));

        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, req);

        assertEquals(2, results.size());
        assertEquals("duplicate", results.get(0).getStatus());
        assertEquals("clean", results.get(1).getStatus());
    }
}
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
mvn test -Dtest=WorkoutImportServiceTest -pl organizador-treinos-back-end
```
Expected: FAIL with `NoSuchMethodError` or compilation error (method not yet defined).

- [ ] **Step 3: Implement analyzeImport in WorkoutService.java**

Add these imports to `WorkoutService.java`:
```java
import org.organizadorTreinos.dto.request.ExerciseImportItem;
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
```

Add these methods to `WorkoutService.java` (before the private `toResponse` method):

```java
public List<ImportAnalyzeResultItem> analyzeImport(User user, ImportAnalyzeRequest request) {
    List<Workout> existingWorkouts = workoutRepository.findByUser(user);
    List<ImportAnalyzeResultItem> results = new ArrayList<>();

    for (ImportWorkoutItem incoming : request.getWorkouts()) {
        Optional<Workout> nameMatch = existingWorkouts.stream()
            .filter(w -> w.getName().equalsIgnoreCase(incoming.getName()))
            .findFirst();

        if (nameMatch.isEmpty()) {
            results.add(new ImportAnalyzeResultItem(incoming, "clean", null, null));
            continue;
        }

        Workout existing = nameMatch.get();
        List<String> existingNames = exerciseRepository.findByWorkout(existing)
            .stream().map(Exercise::getName).collect(Collectors.toList());
        List<String> incomingNames = incoming.getExercises().stream()
            .map(ExerciseImportItem::getName).collect(Collectors.toList());

        double similarity = jaccardSimilarity(existingNames, incomingNames);

        if (similarity >= 0.75) {
            results.add(new ImportAnalyzeResultItem(incoming, "duplicate", existing.getId(), similarity));
        } else {
            results.add(new ImportAnalyzeResultItem(incoming, "clean", null, null));
        }
    }

    return results;
}

private double jaccardSimilarity(List<String> a, List<String> b) {
    Set<String> setA = a.stream().map(String::toLowerCase).collect(Collectors.toSet());
    Set<String> setB = b.stream().map(String::toLowerCase).collect(Collectors.toSet());

    Set<String> union = new HashSet<>(setA);
    union.addAll(setB);

    if (union.isEmpty()) return 1.0;

    Set<String> intersection = new HashSet<>(setA);
    intersection.retainAll(setB);

    return (double) intersection.size() / union.size();
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
mvn test -Dtest=WorkoutImportServiceTest -pl organizador-treinos-back-end
```
Expected: `Tests run: 5, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**

```bash
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutService.java
git add organizador-treinos-back-end/src/test/java/org/organizadorTreinos/service/WorkoutImportServiceTest.java
git commit -m "feat: add analyzeImport with Jaccard similarity duplicate detection"
```

---

## Task 3: WorkoutService.confirmImport() — TDD

**Files:**
- Modify: `organizador-treinos-back-end/src/test/java/org/organizadorTreinos/service/WorkoutImportServiceTest.java`
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutService.java`

- [ ] **Step 1: Add failing tests for confirmImport to WorkoutImportServiceTest.java**

Append these tests inside the `WorkoutImportServiceTest` class (after the existing tests):

```java
    @Test
    @DisplayName("action=create → new workout and exercises created")
    void confirmImport_createAction_createsWorkout() {
        ImportWorkoutItem item = item("New Workout", "Deadlift", "Pull Up");
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item);
        confirmItem.setAction("create");

        ImportResultResponse result = workoutService.confirmImport(user, List.of(confirmItem));

        assertEquals(1, result.getCreated());
        assertEquals(0, result.getReplaced());
        assertEquals(0, result.getSkipped());

        List<Workout> workouts = workoutRepository.findByUser(user);
        assertEquals(2, workouts.size()); // original Push Day + new one

        Workout created = workouts.stream()
            .filter(w -> w.getName().equals("New Workout"))
            .findFirst().orElseThrow();
        List<Exercise> exercises = exerciseRepository.findByWorkout(created);
        assertEquals(2, exercises.size());
        assertTrue(exercises.stream().anyMatch(e -> e.getName().equals("Deadlift")));
        assertTrue(exercises.stream().anyMatch(e -> e.getName().equals("Pull Up")));
    }

    @Test
    @DisplayName("action=replace → existing workout exercises replaced")
    void confirmImport_replaceAction_replacesExercises() {
        ImportWorkoutItem item = item("Push Day", "Romanian Deadlift");
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item);
        confirmItem.setAction("replace");
        confirmItem.setConflictId(existingWorkout.getId());

        ImportResultResponse result = workoutService.confirmImport(user, List.of(confirmItem));

        assertEquals(0, result.getCreated());
        assertEquals(1, result.getReplaced());
        assertEquals(0, result.getSkipped());

        List<Exercise> exercises = exerciseRepository.findByWorkout(existingWorkout);
        assertEquals(1, exercises.size());
        assertEquals("Romanian Deadlift", exercises.get(0).getName());
    }

    @Test
    @DisplayName("action=skip → no changes")
    void confirmImport_skipAction_noChanges() {
        ImportWorkoutItem item = item("Push Day", "Bench Press");
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item);
        confirmItem.setAction("skip");
        confirmItem.setConflictId(existingWorkout.getId());

        ImportResultResponse result = workoutService.confirmImport(user, List.of(confirmItem));

        assertEquals(0, result.getCreated());
        assertEquals(0, result.getReplaced());
        assertEquals(1, result.getSkipped());

        // Original exercises unchanged
        List<Exercise> exercises = exerciseRepository.findByWorkout(existingWorkout);
        assertEquals(3, exercises.size());
    }

    @Test
    @DisplayName("action=replace with wrong user → ForbiddenException")
    void confirmImport_replaceWrongUser_throwsForbidden() {
        User otherUser = new User();
        otherUser.setName("Other");
        otherUser.setEmail("other@test.com");
        otherUser.setPasswordHash("hash");
        userRepository.persist(otherUser);

        ImportWorkoutItem item = item("Push Day", "Squat");
        ImportConfirmItem confirmItem = new ImportConfirmItem();
        confirmItem.setWorkout(item);
        confirmItem.setAction("replace");
        confirmItem.setConflictId(existingWorkout.getId()); // owned by user, not otherUser

        assertThrows(jakarta.ws.rs.ForbiddenException.class,
            () -> workoutService.confirmImport(otherUser, List.of(confirmItem)));
    }
```

Also add this import at the top of the test file:
```java
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
```

- [ ] **Step 2: Run tests — verify new tests FAIL**

```bash
mvn test -Dtest=WorkoutImportServiceTest -pl organizador-treinos-back-end
```
Expected: 4 new tests fail with compilation error (confirmImport not defined yet).

- [ ] **Step 3: Implement confirmImport in WorkoutService.java**

Add these imports to `WorkoutService.java`:
```java
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
```

Add these methods to `WorkoutService.java` (after `analyzeImport`, before `jaccardSimilarity`):

```java
public ImportResultResponse confirmImport(User user, List<ImportConfirmItem> items) {
    int created = 0, replaced = 0, skipped = 0;

    for (ImportConfirmItem item : items) {
        switch (item.getAction()) {
            case "create" -> {
                createFromImport(user, item.getWorkout());
                created++;
            }
            case "replace" -> {
                replaceFromImport(user, item.getConflictId(), item.getWorkout());
                replaced++;
            }
            case "skip" -> skipped++;
        }
    }

    return new ImportResultResponse(created, replaced, skipped);
}

private void createFromImport(User user, ImportWorkoutItem item) {
    Workout workout = new Workout();
    workout.setName(item.getName());
    workout.setUser(user);
    workout.setIsPublic(false);
    workoutRepository.persist(workout);

    for (ExerciseImportItem ex : item.getExercises()) {
        Exercise exercise = new Exercise();
        exercise.setName(ex.getName());
        exercise.setCompleted(ex.getCompleted() != null && ex.getCompleted());
        exercise.setWorkout(workout);
        exerciseRepository.persist(exercise);
    }
}

private void replaceFromImport(User user, UUID conflictId, ImportWorkoutItem item) {
    Workout existing = workoutRepository.find("id", conflictId)
        .firstResultOptional()
        .orElseThrow(() -> new NotFoundException("Workout not found"));

    if (!existing.getUser().getId().equals(user.getId())) {
        throw new ForbiddenException("Only the owner can replace this workout");
    }

    exerciseRepository.delete("workout", existing);
    existing.setName(item.getName());
    workoutRepository.persist(existing);

    for (ExerciseImportItem ex : item.getExercises()) {
        Exercise exercise = new Exercise();
        exercise.setName(ex.getName());
        exercise.setCompleted(ex.getCompleted() != null && ex.getCompleted());
        exercise.setWorkout(existing);
        exerciseRepository.persist(exercise);
    }
}
```

- [ ] **Step 4: Run all import tests — verify all PASS**

```bash
mvn test -Dtest=WorkoutImportServiceTest -pl organizador-treinos-back-end
```
Expected: `Tests run: 9, Failures: 0, Errors: 0`

- [ ] **Step 5: Run full test suite to verify no regressions**

```bash
mvn test -pl organizador-treinos-back-end
```
Expected: BUILD SUCCESS, all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutService.java
git add organizador-treinos-back-end/src/test/java/org/organizadorTreinos/service/WorkoutImportServiceTest.java
git commit -m "feat: add confirmImport to WorkoutService (create/replace/skip actions)"
```

---

## Task 4: WorkoutController Import Endpoints

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/controller/WorkoutController.java`

- [ ] **Step 1: Add imports to WorkoutController.java**

Add to the existing imports block:
```java
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
import java.util.List;
```

- [ ] **Step 2: Add 2 endpoint methods to WorkoutController.java**

Add after the `deleteWorkout` method (before the closing `}`):

```java
    @POST
    @Path("/import/analyze")
    @RolesAllowed("users")
    public Response analyzeImport(@Valid ImportAnalyzeRequest request) {
        User user = getCurrentUser();
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, request);
        return Response.ok(results).build();
    }

    @POST
    @Path("/import/confirm")
    @RolesAllowed("users")
    public Response confirmImport(List<ImportConfirmItem> items) {
        User user = getCurrentUser();
        ImportResultResponse result = workoutService.confirmImport(user, items);
        return Response.ok(result).build();
    }
```

- [ ] **Step 3: Compile check**

```bash
mvn compile -q -pl organizador-treinos-back-end
```
Expected: BUILD SUCCESS.

- [ ] **Step 4: Run full test suite**

```bash
mvn test -pl organizador-treinos-back-end
```
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add organizador-treinos-back-end/src/main/java/org/organizadorTreinos/controller/WorkoutController.java
git commit -m "feat: add /workouts/import/analyze and /workouts/import/confirm endpoints"
```

---

## Task 5: Frontend Service Methods

**Files:**
- Modify: `organizador-treinos-front-end/src/services/workoutService.js`

- [ ] **Step 1: Add analyzeImport and confirmImport to workoutService.js**

Append before the closing `};` of the `workoutService` object:

```javascript
  // POST /workouts/import/analyze - Check for duplicates before import
  analyzeImport: async (workouts) => {
    try {
      const response = await api.post('/workouts/import/analyze', { workouts });
      return response.data; // Array of ImportAnalyzeResultItem
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erro ao analisar importação';
    }
  },

  // POST /workouts/import/confirm - Execute import with user decisions
  confirmImport: async (items) => {
    try {
      const response = await api.post('/workouts/import/confirm', items);
      return response.data; // { created, replaced, skipped }
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erro ao importar treinos';
    }
  },
```

- [ ] **Step 2: Verify no syntax errors**

```bash
node -e "require('./organizador-treinos-front-end/src/services/workoutService.js')" 2>&1 || echo "check syntax"
```
Or just open the file and visually verify the object closing `};` is correct.

- [ ] **Step 3: Commit**

```bash
git add organizador-treinos-front-end/src/services/workoutService.js
git commit -m "feat: add analyzeImport and confirmImport to frontend workoutService"
```

---

## Task 6: Frontend Download Utility

**Files:**
- Create: `organizador-treinos-front-end/src/utils/downloadJson.js`

- [ ] **Step 1: Create downloadJson.js**

```javascript
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add organizador-treinos-front-end/src/utils/downloadJson.js
git commit -m "feat: add downloadJson utility for browser file download"
```

---

## Task 7: WorkoutDetail — Export Single Workout

**Files:**
- Modify: `organizador-treinos-front-end/src/pages/WorkoutDetail/index.js`

- [ ] **Step 1: Add import at top of WorkoutDetail/index.js**

After the existing imports, add:
```javascript
import { downloadJson } from '../../utils/downloadJson';
```

- [ ] **Step 2: Add handleExportJson function**

Add this function after `handleUpdateExercise` (around line 118), before the `if (loading)` block:

```javascript
  const handleExportJson = () => {
    const data = {
      version: 1,
      workouts: [{
        name: workout.name,
        exercises: (workout.exercises || []).map(e => ({
          name: e.name,
          completed: e.completed,
        })),
      }],
    };
    const filename = `${workout.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    downloadJson(filename, data);
  };
```

- [ ] **Step 3: Add Export JSON button to the header div**

Find this block in the JSX (around line 156):
```jsx
          <Button
            Text="Voltar"
            onClick={() => navigate("/myworkouts")}
          />
```

Replace it with:
```jsx
          <div className="d-flex gap-2">
            <Button
              Text="Exportar JSON"
              onClick={handleExportJson}
            />
            <Button
              Text="Voltar"
              onClick={() => navigate("/myworkouts")}
            />
          </div>
```

- [ ] **Step 4: Start dev server and test manually**

```bash
cd organizador-treinos-front-end && npm start
```
- Navigate to a workout detail page
- Click "Exportar JSON"
- Verify a `.json` file downloads with correct structure: `{ version: 1, workouts: [{ name, exercises: [{name, completed}] }] }`

- [ ] **Step 5: Commit**

```bash
git add organizador-treinos-front-end/src/pages/WorkoutDetail/index.js
git commit -m "feat: add Export JSON button to WorkoutDetail page"
```

---

## Task 8: MyWorkouts — Export All + Import UI

**Files:**
- Modify: `organizador-treinos-front-end/src/pages/MyWorkouts/index.js`

- [ ] **Step 1: Add imports at top of MyWorkouts/index.js**

Replace the existing React import line:
```javascript
import React, { useEffect, useState } from "react";
```
With:
```javascript
import React, { useEffect, useState, useRef } from "react";
```

Add these after the existing bootstrap `Card` import:
```javascript
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
```

Add after the existing `workoutService` import:
```javascript
import { downloadJson } from '../../utils/downloadJson';
```

- [ ] **Step 2: Add state variables**

After the existing state declarations (`const [error, setError] = useState("")`), add:

```javascript
  const fileInputRef = useRef(null);
  const [importAnalysis, setImportAnalysis] = useState(null); // null = modal closed
  const [userActions, setUserActions] = useState({});         // index → "create"|"replace"|"skip"
  const [importing, setImporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
```

- [ ] **Step 3: Add handler functions**

Add these functions after `handleDeleteWorkout` (before `if (authLoading || loading)`):

```javascript
  const handleExportAll = async () => {
    if (workouts.length === 0) return;
    try {
      setExportingAll(true);
      const workoutsWithExercises = await Promise.all(
        workouts.map(w => workoutService.getWorkout(w.id))
      );
      const data = {
        version: 1,
        workouts: workoutsWithExercises.map(w => ({
          name: w.name,
          exercises: (w.exercises || []).map(e => ({
            name: e.name,
            completed: e.completed,
          })),
        })),
      };
      downloadJson('my-workouts.json', data);
    } catch (err) {
      setError('Erro ao exportar treinos');
    } finally {
      setExportingAll(false);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';

    if (!file) return;

    let parsed;
    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch {
      setError('Arquivo JSON inválido');
      return;
    }

    if (parsed.version !== 1 || !Array.isArray(parsed.workouts)) {
      setError('Versão de arquivo não suportada ou formato inválido');
      return;
    }

    if (parsed.workouts.length === 0) {
      setError('Nenhum treino encontrado no arquivo');
      return;
    }

    try {
      setImporting(true);
      const analysis = await workoutService.analyzeImport(parsed.workouts);
      const defaultActions = {};
      analysis.forEach((item, idx) => {
        defaultActions[idx] = item.status === 'clean' ? 'create' : 'skip';
      });
      setUserActions(defaultActions);
      setImportAnalysis(analysis);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao analisar arquivo');
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const items = importAnalysis.map((item, idx) => ({
      workout: item.workout,
      action: item.status === 'clean' ? 'create' : (userActions[idx] || 'skip'),
      conflictId: item.conflictId || null,
    }));

    try {
      setImporting(true);
      const result = await workoutService.confirmImport(items);
      setImportAnalysis(null);
      setUserActions({});

      const parts = [];
      if (result.created > 0) parts.push(`${result.created} criado(s)`);
      if (result.replaced > 0) parts.push(`${result.replaced} substituído(s)`);
      if (result.skipped > 0) parts.push(`${result.skipped} ignorado(s)`);
      // Refresh workout list
      const updated = await workoutService.getMyWorkouts();
      setWorkouts(updated);
      // Show success as temporary message (reuse error state styled as success)
      setError(''); 
      alert(`Importação concluída: ${parts.join(', ')}`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao importar treinos');
    } finally {
      setImporting(false);
    }
  };
```

- [ ] **Step 4: Add export-all and import buttons to the header**

Find this block in the JSX (around line 74):
```jsx
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Meus Treinos</h1>
          <Button
            Text="+ Novo Treino"
            onClick={() => navigate("/newworkout")}
          />
        </div>
```

Replace it with:
```jsx
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Meus Treinos</h1>
          <div className="d-flex gap-2">
            <Button
              Text={exportingAll ? "Exportando..." : "Exportar JSON"}
              onClick={handleExportAll}
              disabled={exportingAll || workouts.length === 0}
            />
            <Button
              Text={importing ? "Importando..." : "Importar JSON"}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={importing}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFileChange}
            />
            <Button
              Text="+ Novo Treino"
              onClick={() => navigate("/newworkout")}
            />
          </div>
        </div>
```

- [ ] **Step 5: Add conflict resolution modal**

Add this JSX just before the closing `</>` tag at the end of the component's return statement:

```jsx
      <Modal show={importAnalysis !== null} onHide={() => setImportAnalysis(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Importar Treinos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Treino</th>
                <th>Exercícios</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {(importAnalysis || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.workout.name}</td>
                  <td>{(item.workout.exercises || []).length} exercício(s)</td>
                  <td>
                    {item.status === 'clean' ? (
                      <span className="badge bg-success">Novo</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        Duplicado ({Math.round(item.similarity * 100)}%)
                      </span>
                    )}
                  </td>
                  <td>
                    {item.status === 'clean' ? (
                      <span className="text-muted">Será criado</span>
                    ) : (
                      <Form.Select
                        size="sm"
                        value={userActions[idx] || 'skip'}
                        onChange={e => setUserActions({ ...userActions, [idx]: e.target.value })}
                      >
                        <option value="create">Criar novo</option>
                        <option value="replace">Substituir</option>
                        <option value="skip">Ignorar</option>
                      </Form.Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button Text="Cancelar" onClick={() => setImportAnalysis(null)} />
          <Button
            Text={importing ? "Importando..." : "Confirmar Importação"}
            onClick={handleConfirmImport}
            disabled={importing}
          />
        </Modal.Footer>
      </Modal>
```

- [ ] **Step 6: Start dev server and test manually**

```bash
cd organizador-treinos-front-end && npm start
```

**Test export:**
1. Go to Meus Treinos
2. Click "Exportar JSON" — verify `my-workouts.json` downloads
3. Open file — verify structure: `{ version: 1, workouts: [{name, exercises:[{name,completed}]}] }`

**Test import — clean (no duplicates):**
1. Create a JSON file:
   ```json
   { "version": 1, "workouts": [{ "name": "Novo Treino Import", "exercises": [{"name":"Agachamento","completed":false}] }] }
   ```
2. Click "Importar JSON", select the file
3. Modal should show 1 row with status "Novo"
4. Click "Confirmar Importação"
5. Alert: "Importação concluída: 1 criado(s)"
6. Workout "Novo Treino Import" appears in list

**Test import — with duplicate:**
1. Export a workout that already exists
2. Re-import the exported file
3. Modal shows the workout as "Duplicado (100%)"
4. Select "Substituir" or "Ignorar"
5. Confirm — verify behavior matches selection

**Test invalid file:**
1. Click "Importar JSON", select a non-JSON file (e.g., .txt)
2. Error alert: "Arquivo JSON inválido"

- [ ] **Step 7: Commit**

```bash
git add organizador-treinos-front-end/src/pages/MyWorkouts/index.js
git commit -m "feat: add export-all and import UI with conflict resolution to MyWorkouts"
```

---

## Final Verification

- [ ] **Run full backend test suite**

```bash
mvn test -pl organizador-treinos-back-end
```
Expected: BUILD SUCCESS, all tests pass.

- [ ] **Run frontend tests**

```bash
cd organizador-treinos-front-end && npm test -- --watchAll=false
```
Expected: all existing tests pass (no new frontend tests required — UI flows verified manually).
