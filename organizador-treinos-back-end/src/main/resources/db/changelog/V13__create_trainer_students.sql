--liquibase formatted sql
--changeset organizador-treinos:13
CREATE TABLE trainer_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, student_id)
);
CREATE INDEX idx_trainer_students_trainer ON trainer_students(trainer_id);
CREATE INDEX idx_trainer_students_student ON trainer_students(student_id);
