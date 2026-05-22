--liquibase formatted sql
--changeset organizador-treinos:20

ALTER TABLE workout_shares ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

WITH max_positions AS (
    SELECT id AS user_id, COALESCE((SELECT MAX(position) FROM workouts w WHERE w.user_id = users.id), -1) AS max_pos
    FROM users
),
ranked_shares AS (
    SELECT id, shared_with_user_id, ROW_NUMBER() OVER (PARTITION BY shared_with_user_id ORDER BY created_at ASC) AS rn
    FROM workout_shares
)
UPDATE workout_shares ws
SET position = mp.max_pos + rs.rn
FROM ranked_shares rs
JOIN max_positions mp ON rs.shared_with_user_id = mp.user_id
WHERE ws.id = rs.id;
