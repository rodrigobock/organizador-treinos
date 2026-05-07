# Workout Cycling, Reordering & UI Polish

**Date:** 2026-05-06  
**Status:** Approved

---

## Overview

Three features:
1. Workouts cycle in a user-defined order — finishing one automatically advances to the next.
2. Exercise checkboxes are only interactive when a workout session is active.
3. "Deletar" / "Excluir" buttons replaced with trash/pencil icons.

---

## 1. Data Model (Backend)

### Migration V3 — two new columns

**`workouts` table:**
```sql
ALTER TABLE workouts ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
```
- Represents order within the user's workout cycle.
- Unique per user (no DB constraint needed — enforced by service logic).
- Existing workouts: assigned positions 0, 1, 2, … ordered by `created_at ASC`.

**`users` table:**
```sql
ALTER TABLE users ADD COLUMN current_workout_id BIGINT REFERENCES workouts(id) ON DELETE SET NULL;
```
- Points to the workout that appears as "next" on the Home page.
- `ON DELETE SET NULL`: if that workout is deleted, falls back gracefully.

### Business rules

| Event | Effect on `current_workout_id` |
|-------|-------------------------------|
| Create first workout | Set to that workout |
| Create subsequent workout | Unchanged |
| Session ends (PATCH `.../end`) | Advance to next in `position` order (circular) |
| Delete `current_workout_id` workout | Advance to next; NULL if it was the only one |
| Reorder workouts | `position` fields updated; `current_workout_id` unchanged |

---

## 2. Backend Endpoints

### New endpoint

**`PUT /workouts/reorder`**
- Auth: required (JWT)
- Body: `{ "workoutIds": [3, 1, 2] }` — full ordered list of user's workout IDs
- Validates all IDs belong to the authenticated user
- Updates `position` for each: index 0 → position 0, index 1 → position 1, etc.
- Returns `204 No Content`

### Modified endpoints

**`PATCH /workouts/{id}/sessions/{sessionId}/end`** (existing)
- After ending session: query all user workouts ordered by `position ASC`, find current, set `current_workout_id` to next (circular).

**`POST /workouts`** (existing — create workout)
- Assign `position = MAX(user's workout positions) + 1`.
- If user has no workouts yet: also set `current_workout_id = new workout id` on User.

**`DELETE /workouts/{id}`** (existing)
- If deleted workout is `current_workout_id`: advance to next in order (or NULL if last).

**`GET /users/me`** (existing)
- Add `currentWorkoutId` field to `UserResponse`.

**`GET /workouts`** (existing — list my workouts)
- Order results by `position ASC` instead of current ordering.

---

## 3. Frontend

### 3a. MyWorkouts — drag-and-drop reordering

- Library: `@dnd-kit/core` + `@dnd-kit/sortable`
- Each workout card becomes a `SortableItem` wrapping a drag handle (⠿ icon).
- On drag end: update local state order immediately (optimistic), then call `PUT /workouts/reorder`.
- Show position number badge on each card.

### 3b. Home — "Próximo treino" via `currentWorkoutId`

- `GET /users/me` already called on auth load — add `currentWorkoutId` to `UserResponse` and `AuthContext`.
- Home fetches `workoutService.getWorkout(user.currentWorkoutId)` instead of sorting by `updatedAt`.
- After `endSession()` succeeds: re-fetch `GET /users/me` to get new `currentWorkoutId`, then re-fetch that workout detail. Card re-renders showing the next workout.

### 3c. Exercise checkbox gate

- In `Home/index.js`, exercise row `onClick`: wrap in `if (!activeSession) return;`
- Visual: `cursor: 'default'` and `opacity: 0.5` on checkboxes when `!activeSession`.
- Tooltip or label: "Inicie o treino para marcar exercícios" shown when session inactive.

### 3d. Icon replacements

Library: `react-bootstrap-icons` (already Bootstrap 5 project — consistent ecosystem).

| Location | Old | New |
|----------|-----|-----|
| `MyWorkouts` — workout card | Button "Deletar" | `<Trash size={16} />` icon-only button (`aria-label="Excluir treino"`) |
| `MyWorkouts` — workout card | Button "Ver" | `<PencilSquare size={16} />` icon-only button (`aria-label="Editar treino"`) — navigates to `WorkoutDetail` |
| `WorkoutDetail` — exercise row | Button "Deletar" | `<Trash size={16} />` icon-only button (`aria-label="Excluir exercício"`) |
| `WorkoutDetail` — exercise row | Always-editable input (onBlur) | Keep inline input, add `<PencilSquare size={14} />` as visual prefix indicator only (no behavior change) |

Note: the current codebase has no explicit "Editar" text button. The pencil icon on `MyWorkouts` replaces "Ver" to convey edit intent (since `WorkoutDetail` is where editing happens). The pencil on exercise rows is a non-interactive visual indicator alongside the existing inline input.

---

## 4. Error Handling

- `PUT /workouts/reorder`: if IDs don't match user's workouts → `400 Bad Request`.
- `currentWorkoutId` null (user deleted all workouts): Home shows empty state, no crash.
- Drag-and-drop: on API failure, revert to previous order (rollback local state).

---

## 5. Out of Scope

- PDF export (Phase 4 backlog).
- Pagination of workout list (Phase 5 backlog).
- Sharing-aware cycle (shared workouts not included in cycle).
