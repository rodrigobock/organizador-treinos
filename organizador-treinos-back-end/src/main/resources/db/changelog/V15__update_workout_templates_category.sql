--liquibase formatted sql
--changeset organizador-treinos:15
ALTER TABLE workout_templates ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE';
ALTER TABLE workout_templates ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'UNISEX';

UPDATE workout_templates SET category = 'BEGINNER' WHERE name LIKE '%Iniciante%';
UPDATE workout_templates SET category = 'FUNCTIONAL' WHERE name = 'Treino Funcional';
UPDATE workout_templates SET category = 'FUNCTIONAL' WHERE name LIKE '%Flexibilidade%';
UPDATE workout_templates SET category = 'CALISTHENICS' WHERE name LIKE '%Calistenia%' OR name LIKE 'HIIT Calistenia';

DROP INDEX IF EXISTS idx_workout_templates_goal;
ALTER TABLE workout_templates DROP COLUMN goal;

CREATE INDEX idx_workout_templates_category ON workout_templates(category);
CREATE INDEX idx_workout_templates_gender ON workout_templates(gender);
