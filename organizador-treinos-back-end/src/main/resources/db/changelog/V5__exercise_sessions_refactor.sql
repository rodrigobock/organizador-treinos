-- Cria tabela exercise_session para rastrear exercícios completados por sessão
CREATE TABLE exercise_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exercise_id, session_id)
);

CREATE INDEX idx_exercise_session_session ON exercise_session(session_id);
CREATE INDEX idx_exercise_session_exercise ON exercise_session(exercise_id);

-- Remove coluna completed de exercises (dados não deletados, histórico preservado em exercise_session)
ALTER TABLE exercises DROP COLUMN completed;
