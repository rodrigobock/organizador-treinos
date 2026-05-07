# Workout Cycling Implementation Plan

**Goal:** Workouts cycle in user-defined drag-and-drop order; exercise checkboxes gated by active session; delete/edit buttons become icons.

**Architecture:** Backend adds `position` (Workout) + `current_workout_id` (User); session end advances pointer circularly. Frontend adds dnd-kit drag reorder in MyWorkouts, Home loads workout by `currentWorkoutId`, icons via react-bootstrap-icons.

**Tech Stack:** Quarkus Panache, Liquibase, React 18, @dnd-kit/core + @dnd-kit/sortable, react-bootstrap-icons

---

## Task 1 — DB Migration V4

**Files:**
- Create: `organizador-treinos-back-end/src/main/resources/db/changelog/V4__add_workout_position_and_current.sql`
- Modify: `organizador-treinos-back-end/src/main/resources/db/changelog/changelog-master.xml`

- [ ] Create SQL migration
- [ ] Register in changelog-master.xml

## Task 2 — Backend Entities

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/entity/Workout.java`
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/entity/User.java`

- [ ] Add `position` field to Workout entity
- [ ] Add `currentWorkoutId` UUID field to User entity (column `current_workout_id`, nullable)

## Task 3 — Repository + DTO

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/repository/WorkoutRepository.java`
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/response/UserResponse.java`

- [ ] Add `findByUserOrderedByPosition(User user)` to WorkoutRepository
- [ ] Add `currentWorkoutId` field to UserResponse

## Task 4 — WorkoutService updates

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutService.java`

- [ ] `createWorkout`: assign position = count of user workouts; if first workout, set user.currentWorkoutId
- [ ] `getUserWorkouts`: use findByUserOrderedByPosition
- [ ] `deleteWorkout`: if deleted workout is currentWorkoutId, advance to next (or null)
- [ ] Add `reorderWorkouts(User, List<UUID>)`: validate all IDs belong to user, set position by index

## Task 5 — WorkoutSessionService: advance on end

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/WorkoutSessionService.java`
- Inject: UserRepository

- [ ] After `session.setEndedAt(...)`, call `advanceCurrentWorkout(user, workoutId)`
- [ ] `advanceCurrentWorkout`: get ordered list, find current index, set next (circular)

## Task 6 — WorkoutController: reorder endpoint + UserService

**Files:**
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/controller/WorkoutController.java`
- Modify: `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/UserService.java`

- [ ] Add `PUT /workouts/reorder` endpoint (body: `ReorderWorkoutsRequest`)
- [ ] Create `ReorderWorkoutsRequest` DTO with `List<UUID> workoutIds`
- [ ] Update `UserService.getUserById` to include `currentWorkoutId` from user entity

## Task 7 — Frontend: install deps + workoutService

- [ ] `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-bootstrap-icons`
- [ ] Add `reorderWorkouts(workoutIds)` to workoutService.js

## Task 8 — Frontend: MyWorkouts (drag-and-drop + icons)

**Files:**
- Modify: `organizador-treinos-front-end/src/pages/MyWorkouts/index.js`

- [ ] Wrap workout list in DndContext + SortableContext
- [ ] Each card is a SortableItem with drag handle
- [ ] On drag end: reorder local state + call workoutService.reorderWorkouts
- [ ] Replace "Deletar" with `<Trash />` icon button
- [ ] Replace "Ver" with `<PencilSquare />` icon button

## Task 9 — Frontend: Home (currentWorkoutId + checkbox gate)

**Files:**
- Modify: `organizador-treinos-front-end/src/pages/Home/index.js`

- [ ] Load workout via `user.currentWorkoutId` (from authService.getCurrentUser)
- [ ] After endSession: re-fetch getCurrentUser to get new currentWorkoutId, reload that workout
- [ ] Gate exercise toggle: `if (!activeSession) return;` + visual disabled state

## Task 10 — Frontend: WorkoutDetail (trash icon)

**Files:**
- Modify: `organizador-treinos-front-end/src/pages/WorkoutDetail/index.js`

- [ ] Replace "Deletar" button on exercise rows with `<Trash size={16} />` icon button
