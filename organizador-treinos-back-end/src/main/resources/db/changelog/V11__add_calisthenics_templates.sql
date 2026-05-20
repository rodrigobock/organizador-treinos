--liquibase formatted sql

--changeset organizador-treinos:11

-- SEED: Calistenia Iniciante
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Calistenia Iniciante', 'Treino de calistenia para iniciantes com exercicios basicos usando apenas o peso corporal. Ideal para construir uma base de forca.', 'STRENGTH');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Push-ups', 3, 10, 0 FROM workout_templates WHERE name = 'Calistenia Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Squats', 3, 15, 1 FROM workout_templates WHERE name = 'Calistenia Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Planks', 3, 30, 2 FROM workout_templates WHERE name = 'Calistenia Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Lunges', 3, 12, 3 FROM workout_templates WHERE name = 'Calistenia Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mountain Climbers', 3, 20, 4 FROM workout_templates WHERE name = 'Calistenia Iniciante';

-- SEED: Calistenia Intermediario
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Calistenia Intermediario', 'Treino de calistenia intermediario com variacoes avancadas de exercicios corporais para desenvolver forca e controle.', 'STRENGTH');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Diamond Push-ups', 4, 8, 0 FROM workout_templates WHERE name = 'Calistenia Intermediario';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Pike Push-ups', 3, 10, 1 FROM workout_templates WHERE name = 'Calistenia Intermediario';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Bulgarian Split Squats', 3, 10, 2 FROM workout_templates WHERE name = 'Calistenia Intermediario';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'L-sit Hold', 3, 10, 3 FROM workout_templates WHERE name = 'Calistenia Intermediario';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Handstand Hold', 3, 20, 4 FROM workout_templates WHERE name = 'Calistenia Intermediario';

-- SEED: HIIT Calistenia
INSERT INTO workout_templates (name, description, goal) VALUES
    ('HIIT Calistenia', 'Treino intervalado de alta intensidade com exercicios de calistenia. Excelente para queima de gordura e condicionamento cardiovascular.', 'CARDIO');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Burpees', 4, 10, 0 FROM workout_templates WHERE name = 'HIIT Calistenia';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Jump Squats', 4, 15, 1 FROM workout_templates WHERE name = 'HIIT Calistenia';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'High Knees', 3, 30, 2 FROM workout_templates WHERE name = 'HIIT Calistenia';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Jumping Jacks', 3, 40, 3 FROM workout_templates WHERE name = 'HIIT Calistenia';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Box Jumps', 3, 10, 4 FROM workout_templates WHERE name = 'HIIT Calistenia';

-- SEED: Calistenia Superior
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Calistenia Superior', 'Treino de calistenia focado na parte superior do corpo. Trabalha costas, peito, ombros e bracos com exercicios avancados.', 'STRENGTH');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Pull-ups', 4, 6, 0 FROM workout_templates WHERE name = 'Calistenia Superior';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Dips', 4, 8, 1 FROM workout_templates WHERE name = 'Calistenia Superior';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Pike Push-ups', 3, 10, 2 FROM workout_templates WHERE name = 'Calistenia Superior';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Archer Push-ups', 3, 6, 3 FROM workout_templates WHERE name = 'Calistenia Superior';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Pseudo Planche Push-ups', 3, 8, 4 FROM workout_templates WHERE name = 'Calistenia Superior';

-- SEED: Flexibilidade e Mobilidade
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Flexibilidade e Mobilidade', 'Treino focado em flexibilidade e mobilidade articular. Ideal para recuperacao ativa, prevencao de lesoes e melhora da amplitude de movimento.', 'FLEXIBILITY');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hip Flexor Stretch', 3, 30, 0 FROM workout_templates WHERE name = 'Flexibilidade e Mobilidade';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hamstring Stretch', 3, 30, 1 FROM workout_templates WHERE name = 'Flexibilidade e Mobilidade';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Thoracic Rotation', 3, 10, 2 FROM workout_templates WHERE name = 'Flexibilidade e Mobilidade';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Shoulder Dislocates', 3, 10, 3 FROM workout_templates WHERE name = 'Flexibilidade e Mobilidade';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'World''s Greatest Stretch', 3, 5, 4 FROM workout_templates WHERE name = 'Flexibilidade e Mobilidade';
