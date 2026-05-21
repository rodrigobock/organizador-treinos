--liquibase formatted sql
--changeset organizador-treinos:17

INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Glúteos e Pernas - Iniciante Feminino', 'Treino focado em glúteos e pernas para mulheres iniciantes. Ênfase em hip thrust e exercícios de isolamento.', 'BEGINNER', 'FEMALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hip Thrust', 4, 15, 0 FROM workout_templates WHERE name = 'Glúteos e Pernas - Iniciante Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Sumo', 3, 15, 1 FROM workout_templates WHERE name = 'Glúteos e Pernas - Iniciante Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Abdutora', 3, 20, 2 FROM workout_templates WHERE name = 'Glúteos e Pernas - Iniciante Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Afundo Alternado', 3, 12, 3 FROM workout_templates WHERE name = 'Glúteos e Pernas - Iniciante Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação Pélvica', 3, 15, 4 FROM workout_templates WHERE name = 'Glúteos e Pernas - Iniciante Feminino';

INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Full Body Feminino - Intermediário', 'Treino completo para mulheres com foco em tônus e definição muscular.', 'INTERMEDIATE', 'FEMALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 4, 12, 0 FROM workout_templates WHERE name = 'Full Body Feminino - Intermediário';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hip Thrust com Barra', 4, 12, 1 FROM workout_templates WHERE name = 'Full Body Feminino - Intermediário';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Unilateral', 3, 12, 2 FROM workout_templates WHERE name = 'Full Body Feminino - Intermediário';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino com Halteres', 3, 12, 3 FROM workout_templates WHERE name = 'Full Body Feminino - Intermediário';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Prancha', 3, 45, 4 FROM workout_templates WHERE name = 'Full Body Feminino - Intermediário';

INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Peito e Tríceps - Intermediário Masculino', 'Treino de empurrar para homens com foco em hipertrofia de peito e tríceps.', 'INTERMEDIATE', 'MALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra', 4, 10, 0 FROM workout_templates WHERE name = 'Peito e Tríceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Inclinado com Halteres', 3, 12, 1 FROM workout_templates WHERE name = 'Peito e Tríceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Crucifixo', 3, 12, 2 FROM workout_templates WHERE name = 'Peito e Tríceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Pulley', 4, 12, 3 FROM workout_templates WHERE name = 'Peito e Tríceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Mergulho', 3, 10, 4 FROM workout_templates WHERE name = 'Peito e Tríceps - Intermediário Masculino';

INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Costas e Bíceps - Intermediário Masculino', 'Treino de puxar para homens com foco em largura e espessura das costas.', 'INTERMEDIATE', 'MALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Puxada Frontal', 4, 10, 0 FROM workout_templates WHERE name = 'Costas e Bíceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra', 4, 10, 1 FROM workout_templates WHERE name = 'Costas e Bíceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Barra Fixa', 3, 8, 2 FROM workout_templates WHERE name = 'Costas e Bíceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Direta com Barra', 3, 12, 3 FROM workout_templates WHERE name = 'Costas e Bíceps - Intermediário Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Martelo', 3, 12, 4 FROM workout_templates WHERE name = 'Costas e Bíceps - Intermediário Masculino';
