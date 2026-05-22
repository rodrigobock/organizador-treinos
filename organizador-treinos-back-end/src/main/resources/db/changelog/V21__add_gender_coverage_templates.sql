--liquibase formatted sql
--changeset organizador-treinos:21

-- FEMALE: Intermediário - Glúteos e Pernas (progressão do iniciante)
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Glúteos e Pernas - Intermediário Feminino', 'Progressão do treino iniciante de glúteos e pernas. Volume e intensidade maiores com hip thrust com barra e variações avançadas de agachamento.', 'INTERMEDIATE', 'FEMALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hip Thrust com Barra', 4, 12, 0 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Sumô com Haltere', 4, 12, 1 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Extensão de Quadril no Cabo', 4, 15, 2 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Afundo com Halteres', 3, 12, 3 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Abdutora', 3, 20, 4 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Stiff com Halteres', 3, 12, 5 FROM workout_templates WHERE name = 'Glúteos e Pernas - Intermediário Feminino';

-- FEMALE: Intermediário - Abdômen e Core
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Abdômen e Core - Feminino', 'Treino focado em abdômen e fortalecimento do core para mulheres. Combinação de exercícios isométricos e dinâmicos para definição e estabilidade.', 'INTERMEDIATE', 'FEMALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Prancha Abdominal', 4, 45, 0 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Crunch Abdominal', 4, 20, 1 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação de Pernas', 3, 15, 2 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Russian Twist', 3, 20, 3 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Prancha Lateral', 3, 30, 4 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Dead Bug', 3, 10, 5 FROM workout_templates WHERE name = 'Abdômen e Core - Feminino';

-- FEMALE: Avançado - Corpo Inteiro
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Corpo Inteiro - Avançado Feminino', 'Treino avançado de corpo inteiro para mulheres. Alto volume combinando glúteos pesados, costas, ombros e metabolismo acelerado.', 'ADVANCED', 'FEMALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Hip Thrust com Barra', 5, 8, 0 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 4, 8, 1 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Levantamento Terra Romeno', 4, 10, 2 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada com Halteres', 4, 10, 3 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino com Halteres', 3, 12, 4 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Halteres', 3, 12, 5 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Extensão de Quadril no Cabo', 4, 15, 6 FROM workout_templates WHERE name = 'Corpo Inteiro - Avançado Feminino';

-- MALE: Iniciante - Peito e Tríceps
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Peito e Tríceps - Iniciante Masculino', 'Introdução ao treino de empurrar para homens iniciantes. Exercícios básicos para aprender a técnica com carga moderada antes de progredir para barra.', 'BEGINNER', 'MALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Flexão de Braço', 3, 10, 0 FROM workout_templates WHERE name = 'Peito e Tríceps - Iniciante Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino com Halteres Leves', 3, 12, 1 FROM workout_templates WHERE name = 'Peito e Tríceps - Iniciante Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Crucifixo com Halteres Leves', 3, 12, 2 FROM workout_templates WHERE name = 'Peito e Tríceps - Iniciante Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps no Banco', 3, 12, 3 FROM workout_templates WHERE name = 'Peito e Tríceps - Iniciante Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Extensão de Tríceps com Halter', 3, 12, 4 FROM workout_templates WHERE name = 'Peito e Tríceps - Iniciante Masculino';

-- MALE: Intermediário - Ombros e Trapézio
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Ombros e Trapézio - Masculino', 'Treino focado em ombros e trapézio para homens. Desenvolvimento de largura e espessura dos ombros com exercícios compostos e isolados.', 'INTERMEDIATE', 'MALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Barra', 4, 8, 0 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação Lateral', 4, 15, 1 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação Frontal com Halteres', 3, 12, 2 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Alta com Barra', 3, 12, 3 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Encolhimento de Ombros com Halteres', 4, 15, 4 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Face Pull no Cabo', 3, 15, 5 FROM workout_templates WHERE name = 'Ombros e Trapézio - Masculino';

-- MALE: Avançado - Pernas
INSERT INTO workout_templates (name, description, category, gender) VALUES
    ('Pernas - Avançado Masculino', 'Treino avançado de pernas para homens com foco em força e hipertrofia máxima. Alto volume em agachamento com técnicas de intensidade avançadas.', 'ADVANCED', 'MALE');
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 5, 5, 0 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Búlgaro', 4, 8, 1 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Leg Press 45°', 4, 12, 2 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Stiff com Barra', 4, 10, 3 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Extensora', 3, 15, 4 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mesa Flexora', 3, 12, 5 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Panturrilha em Pé com Carga', 5, 20, 6 FROM workout_templates WHERE name = 'Pernas - Avançado Masculino';
