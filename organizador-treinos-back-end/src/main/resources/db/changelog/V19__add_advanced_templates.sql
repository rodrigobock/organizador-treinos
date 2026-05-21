--liquibase formatted sql
--changeset organizador-treinos:19

-- PPL Avançado - Push
INSERT INTO workout_templates (name, description, category) VALUES
    ('PPL Avançado - Push', 'Treino de empurrar para atletas avançados. Alto volume, técnicas de intensidade como drop sets e rest-pause.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra', 5, 5, 0 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Inclinado com Halteres', 4, 8, 1 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Crossover no Cabo', 3, 12, 2 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Barra', 5, 5, 3 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação Lateral com Cabos', 4, 15, 4 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mergulho nas Paralelas com Carga', 4, 8, 5 FROM workout_templates WHERE name = 'PPL Avançado - Push';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Francês com Barra EZ', 3, 10, 6 FROM workout_templates WHERE name = 'PPL Avançado - Push';

-- PPL Avançado - Pull
INSERT INTO workout_templates (name, description, category) VALUES
    ('PPL Avançado - Pull', 'Treino de puxar para atletas avançados. Foco em força e hipertrofia máxima de costas e bíceps.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Levantamento Terra', 5, 5, 0 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Barra Fixa com Carga', 4, 8, 1 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra', 4, 8, 2 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Pulldown Pegada Neutra', 3, 10, 3 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Unilateral com Halter', 4, 10, 4 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Direta com Barra', 4, 8, 5 FROM workout_templates WHERE name = 'PPL Avançado - Pull';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Martelo Alternada', 3, 10, 6 FROM workout_templates WHERE name = 'PPL Avançado - Pull';

-- PPL Avançado - Legs
INSERT INTO workout_templates (name, description, category) VALUES
    ('PPL Avançado - Legs', 'Treino de pernas para atletas avançados. Agachamento pesado, leg press e isolamento com alto volume.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 5, 5, 0 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Leg Press 45°', 4, 12, 1 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Búlgaro', 3, 10, 2 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Extensão de Quadril no Cabo', 4, 15, 3 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Extensora', 3, 15, 4 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mesa Flexora', 3, 12, 5 FROM workout_templates WHERE name = 'PPL Avançado - Legs';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Panturrilha em Pé com Carga', 5, 20, 6 FROM workout_templates WHERE name = 'PPL Avançado - Legs';

-- GVT - German Volume Training
INSERT INTO workout_templates (name, description, category) VALUES
    ('GVT - Volume Alemão', 'German Volume Training: 10 séries de 10 repetições nos movimentos compostos. Protocolo avançado para hipertrofia máxima.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra (10x10)', 10, 10, 0 FROM workout_templates WHERE name = 'GVT - Volume Alemão';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra (10x10)', 10, 10, 1 FROM workout_templates WHERE name = 'GVT - Volume Alemão';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Corda (3x15)', 3, 15, 2 FROM workout_templates WHERE name = 'GVT - Volume Alemão';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Direta (3x15)', 3, 15, 3 FROM workout_templates WHERE name = 'GVT - Volume Alemão';

-- Powerlifting Avançado
INSERT INTO workout_templates (name, description, category) VALUES
    ('Powerlifting - Treino A', 'Foco em agachamento e supino. Protocolo para atletas de força com periodização de intensidade.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra (heavy)', 5, 3, 0 FROM workout_templates WHERE name = 'Powerlifting - Treino A';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra (back-off)', 3, 8, 1 FROM workout_templates WHERE name = 'Powerlifting - Treino A';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra (heavy)', 5, 3, 2 FROM workout_templates WHERE name = 'Powerlifting - Treino A';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra (back-off)', 3, 8, 3 FROM workout_templates WHERE name = 'Powerlifting - Treino A';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Leg Press (assistência)', 3, 10, 4 FROM workout_templates WHERE name = 'Powerlifting - Treino A';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps com Corda (assistência)', 3, 12, 5 FROM workout_templates WHERE name = 'Powerlifting - Treino A';

-- Powerlifting Avançado - Treino B
INSERT INTO workout_templates (name, description, category) VALUES
    ('Powerlifting - Treino B', 'Foco em levantamento terra e desenvolvimento. Protocolo para atletas de força avançados.', 'ADVANCED');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Levantamento Terra (heavy)', 5, 3, 0 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Levantamento Terra Romeno', 3, 6, 1 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Barra (heavy)', 5, 3, 2 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra', 4, 8, 3 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Barra Fixa com Carga', 4, 6, 4 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Frontal', 3, 5, 5 FROM workout_templates WHERE name = 'Powerlifting - Treino B';
