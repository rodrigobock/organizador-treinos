# Workout JSON Export/Import — Design Spec
Date: 2026-05-06

## Overview

Add JSON export (single workout + all workouts) and JSON import (with fuzzy duplicate detection and conflict resolution) to the workout organizer.

No PDF export. JSON only.

---

## JSON Format

```json
{
  "version": 1,
  "workouts": [
    {
      "name": "Push Day",
      "exercises": [
        { "name": "Bench Press", "completed": false },
        { "name": "Shoulder Press", "completed": false }
      ]
    }
  ]
}
```

- `version`: integer, reserved for future format changes. Currently `1`.
- Single-workout export uses the same structure (array with 1 item).
- No IDs, no user data, no timestamps — portable across accounts.

---

## Backend

### New Endpoints

```
POST /workouts/import/analyze
  Auth: required
  Body: { "workouts": [{ "name": string, "exercises": [{ "name": string, "completed": boolean }] }] }
  Returns: [{ "workout": {...}, "status": "clean"|"duplicate", "conflictId": Long?, "similarity": float? }]

POST /workouts/import/confirm
  Auth: required
  Body: [{ "workout": {...}, "action": "create"|"replace"|"skip", "conflictId": Long? }]
  Returns: { "created": int, "replaced": int, "skipped": int }
```

Both endpoints are `@RolesAllowed("user")` (same as existing workout endpoints).

### New DTOs

| File | Purpose |
|------|---------|
| `ImportWorkoutItem.java` | `name` + `List<ExerciseImportItem>` |
| `ExerciseImportItem.java` | `name` + `completed` |
| `ImportAnalyzeRequest.java` | wraps `List<ImportWorkoutItem>` |
| `ImportAnalyzeResultItem.java` | per-workout: `workout`, `status`, `conflictId?`, `similarity?` |
| `ImportConfirmItem.java` | `workout` + `action` + `conflictId?` |
| `ImportResultResponse.java` | `created`, `replaced`, `skipped` |

### Service Logic

**`analyzeImport(userId, List<ImportWorkoutItem>)`**
1. Load all user's existing workouts (with exercises) once.
2. For each incoming workout:
   a. Find existing workout with same name (case-insensitive).
   b. If none → status `clean`.
   c. If found → compute Jaccard similarity on exercise name sets (case-insensitive).
   d. similarity ≥ 0.75 → status `duplicate`, return `conflictId` + `similarity`.
   e. similarity < 0.75 → status `clean` (names match but content differs enough).

**`confirmImport(userId, List<ImportConfirmItem>)`**
1. For each item:
   - `create`: insert new Workout + Exercises owned by current user.
   - `replace`: load workout by `conflictId`, verify ownership, delete existing exercises, insert new exercises from import data, update name.
   - `skip`: no-op.
2. Return counts.

**Jaccard similarity:**
```
similarity = |A ∩ B| / |A ∪ B|
```
Where A and B are sets of lowercase exercise names.

### Modified Files (Backend)
- `WorkoutController.java` — add 2 endpoints
- `WorkoutService.java` — add `analyzeImport()` and `confirmImport()`

---

## Frontend

### Export

**WorkoutDetail page** — "Export JSON" button (top of page, near edit/delete):
- Assembles `{ version: 1, workouts: [{ name, exercises: [{name, completed}] }] }` from already-loaded workout data.
- Triggers browser download as `{workout-name}.json`.
- No API call.

**MyWorkouts page** — "Export All" button:
- Assembles from already-loaded workouts list (which includes exercises via `WorkoutResponse`).
- Triggers browser download as `my-workouts.json`.
- No API call.

### Import (MyWorkouts page only)

**UI flow:**
1. "Import JSON" button → triggers hidden `<input type="file" accept=".json">`.
2. Parse file. Validate: must be valid JSON, must have `version === 1`, must have `workouts` array.
3. Invalid file → error toast, abort.
4. `POST /workouts/import/analyze` with parsed workouts.
5. If all `clean` → simple confirmation modal: "X workouts will be imported. Confirm?"
6. If any `duplicate` → conflict resolution modal:

```
| Workout Name | Status           | Action                          |
|--------------|------------------|---------------------------------|
| Push Day     | duplicate (82%)  | [Create New] [Replace] [Skip]   |
| Leg Day      | clean            | will be created (no choice)     |
```

7. User sets action for each duplicate (default: `skip`).
8. `POST /workouts/import/confirm` with decisions.
9. Success toast: "3 created, 1 replaced, 1 skipped".
10. Refresh workout list.

### Modified Files (Frontend)
- `workoutService.js` — add `analyzeImport(workouts)` and `confirmImport(items)`
- `MyWorkouts/index.js` — import button, file input, conflict modal, export-all button
- `WorkoutDetail/index.js` — export single button

---

## Error Handling

| Scenario | Behavior |
|----------|---------|
| Invalid JSON file | Toast: "Arquivo JSON inválido", abort |
| Wrong version | Toast: "Versão de arquivo não suportada", abort |
| Empty workouts array | Toast: "Nenhum treino encontrado no arquivo", abort |
| `replace` on workout not owned by user | Backend returns 403, frontend shows error toast |
| Backend error | Display `ErrorResponse.message` in toast |

---

## Out of Scope

- PDF export
- Import from other apps (only files exported from this app)
- Sharing imported workouts directly
- Import on WorkoutDetail page (only MyWorkouts)
