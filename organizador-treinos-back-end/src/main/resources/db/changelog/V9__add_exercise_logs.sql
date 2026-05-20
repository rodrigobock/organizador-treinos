--liquibase formatted sql

--changeset organizador-treinos:9
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight FLOAT,
    reps INT,
    sets INT,
    logged_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);
CREATE INDEX idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_exercise_user ON exercise_logs(exercise_id, user_id, logged_at DESC);
