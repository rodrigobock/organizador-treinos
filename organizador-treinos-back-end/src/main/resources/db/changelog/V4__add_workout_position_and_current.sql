ALTER TABLE workouts ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users ADD COLUMN current_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL;

-- Assign initial positions ordered by created_at per user
WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS rn
    FROM workouts
)
UPDATE workouts SET position = ranked.rn
FROM ranked WHERE workouts.id = ranked.id;

-- Set current_workout_id to position=0 workout for each user
UPDATE users u
SET current_workout_id = (
    SELECT w.id FROM workouts w
    WHERE w.user_id = u.id
    ORDER BY w.position ASC
    LIMIT 1
)
WHERE EXISTS (SELECT 1 FROM workouts w WHERE w.user_id = u.id);
