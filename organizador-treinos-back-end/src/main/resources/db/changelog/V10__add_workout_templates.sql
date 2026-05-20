--liquibase formatted sql

--changeset organizador-treinos:10

-- WORKOUT TEMPLATES
CREATE TABLE workout_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_templates_goal ON workout_templates(goal);

-- TEMPLATE EXERCISES
CREATE TABLE template_exercises (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sets INT,
    reps INT,
    order_index INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_template_exercises_template_id ON template_exercises(template_id);

-- SEED: PPL Push (Peito, Ombro, Tríceps)
INSERT INTO workout_templates (name, description, goal) VALUES
    ('PPL - Push (Peito, Ombro, Tríceps)', 'Treino de empurrar focado em peito, ombros e tríceps. Ideal para ganho de massa muscular.', 'HIPERTROFIA');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra', 4, 10, 0 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Inclinado com Halteres', 3, 12, 1 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Halteres', 4, 10, 2 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Elevação Lateral', 3, 15, 3 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Corda no Pulley', 3, 12, 4 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Francês', 3, 10, 5 FROM workout_templates WHERE name = 'PPL - Push (Peito, Ombro, Tríceps)';

-- SEED: PPL Pull (Costas, Bíceps)
INSERT INTO workout_templates (name, description, goal) VALUES
    ('PPL - Pull (Costas, Bíceps)', 'Treino de puxar focado em costas e bíceps. Desenvolve largura e espessura das costas.', 'HIPERTROFIA');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Barra Fixa (Pegada Pronada)', 4, 8, 0 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra', 4, 10, 1 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Puxada Frontal no Pulley', 3, 12, 2 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Unilateral com Halter', 3, 12, 3 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Direta com Barra', 3, 10, 4 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Concentrada', 3, 12, 5 FROM workout_templates WHERE name = 'PPL - Pull (Costas, Bíceps)';

-- SEED: PPL Legs (Pernas)
INSERT INTO workout_templates (name, description, goal) VALUES
    ('PPL - Legs (Pernas)', 'Treino completo de pernas: quadríceps, posteriores de coxa e panturrilha.', 'HIPERTROFIA');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 4, 8, 0 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Leg Press 45°', 4, 12, 1 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Extensora', 3, 15, 2 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mesa Flexora', 3, 12, 3 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Stiff com Barra', 3, 10, 4 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Panturrilha em Pé', 4, 20, 5 FROM workout_templates WHERE name = 'PPL - Legs (Pernas)';

-- SEED: Upper Body
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Upper Body (Parte Superior)', 'Treino completo da parte superior do corpo. Combina empurrar e puxar em uma única sessão.', 'FORCA');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Supino Reto com Barra', 4, 5, 0 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada Curvada com Barra', 4, 5, 1 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Barra', 3, 6, 2 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Barra Fixa (Pegada Supinada)', 3, 8, 3 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Tríceps Mergulho', 3, 10, 4 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Rosca Direta com Halteres', 3, 10, 5 FROM workout_templates WHERE name = 'Upper Body (Parte Superior)';

-- SEED: Lower Body
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Lower Body (Parte Inferior)', 'Treino completo da parte inferior. Foco em força e hipertrofia de pernas e glúteos.', 'FORCA');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento com Barra', 5, 5, 0 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Levantamento Terra', 4, 5, 1 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Afundo com Halteres', 3, 10, 2 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Leg Press 45°', 3, 12, 3 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Cadeira Flexora', 3, 12, 4 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Panturrilha Sentado', 4, 15, 5 FROM workout_templates WHERE name = 'Lower Body (Parte Inferior)';

-- SEED: Full Body Iniciante
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Full Body Iniciante', 'Treino de corpo inteiro ideal para quem está começando. Movimentos básicos com foco em aprendizado técnico.', 'INICIANTE');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Agachamento Livre (Sem Carga)', 3, 12, 0 FROM workout_templates WHERE name = 'Full Body Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Flexão de Braço', 3, 10, 1 FROM workout_templates WHERE name = 'Full Body Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Remada com Faixa Elástica', 3, 12, 2 FROM workout_templates WHERE name = 'Full Body Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Afundo Alternado', 3, 10, 3 FROM workout_templates WHERE name = 'Full Body Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Desenvolvimento com Halteres Leves', 3, 12, 4 FROM workout_templates WHERE name = 'Full Body Iniciante';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Prancha Abdominal', 3, 30, 5 FROM workout_templates WHERE name = 'Full Body Iniciante';

-- SEED: Treino Funcional
INSERT INTO workout_templates (name, description, goal) VALUES
    ('Treino Funcional', 'Treino funcional de alta intensidade para melhorar condicionamento físico, coordenação e mobilidade.', 'FUNCIONAL');

INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Burpee', 4, 10, 0 FROM workout_templates WHERE name = 'Treino Funcional';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Kettlebell Swing', 4, 15, 1 FROM workout_templates WHERE name = 'Treino Funcional';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Box Jump', 3, 12, 2 FROM workout_templates WHERE name = 'Treino Funcional';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Mountain Climber', 3, 20, 3 FROM workout_templates WHERE name = 'Treino Funcional';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Turkish Get-Up', 3, 5, 4 FROM workout_templates WHERE name = 'Treino Funcional';
INSERT INTO template_exercises (template_id, name, sets, reps, order_index)
SELECT id, 'Farmer Walk (30m)', 3, 3, 5 FROM workout_templates WHERE name = 'Treino Funcional';
