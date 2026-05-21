--liquibase formatted sql
--changeset organizador-treinos:14
ALTER TABLE exercises ADD COLUMN sets INTEGER;
ALTER TABLE exercises ADD COLUMN reps_min INTEGER;
ALTER TABLE exercises ADD COLUMN reps_max INTEGER;
ALTER TABLE exercises ADD COLUMN weight DECIMAL(10,2);

CREATE TABLE exercise_catalog (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'GERAL'
);
CREATE INDEX idx_exercise_catalog_name ON exercise_catalog(name);

INSERT INTO exercise_catalog (name, category) VALUES
('Supino Reto','PEITO'),('Supino Inclinado','PEITO'),('Supino Declinado','PEITO'),
('Crucifixo','PEITO'),('Pullover','PEITO'),('Flexão de Braço','PEITO'),('Crossover','PEITO'),
('Puxada Frontal','COSTAS'),('Remada Curvada','COSTAS'),('Remada Unilateral','COSTAS'),
('Remada Baixa','COSTAS'),('Levantamento Terra','COSTAS'),('Barra Fixa','COSTAS'),
('Remada Alta','OMBROS'),('Desenvolvimento com Halteres','OMBROS'),('Desenvolvimento com Barra','OMBROS'),
('Elevação Lateral','OMBROS'),('Elevação Frontal','OMBROS'),
('Rosca Direta','BICEPS'),('Rosca Alternada','BICEPS'),('Rosca Martelo','BICEPS'),
('Rosca Scott','BICEPS'),('Rosca Concentrada','BICEPS'),
('Tríceps Pulley','TRICEPS'),('Tríceps Testa','TRICEPS'),('Tríceps Francês','TRICEPS'),
('Tríceps Mergulho','TRICEPS'),('Extensão de Tríceps','TRICEPS'),
('Agachamento Livre','PERNAS'),('Agachamento com Barra','PERNAS'),('Agachamento Hack','PERNAS'),
('Leg Press','PERNAS'),('Extensão de Pernas','PERNAS'),('Flexão de Pernas','PERNAS'),
('Mesa Flexora','PERNAS'),('Stiff','PERNAS'),('Avanço','PERNAS'),('Afundo','PERNAS'),
('Cadeira Abdutora','PERNAS'),('Cadeira Adutora','PERNAS'),
('Hip Thrust','GLUTEOS'),('Elevação Pélvica','GLUTEOS'),('Agachamento Sumo','GLUTEOS'),
('Panturrilha em Pé','PANTURRILHA'),('Panturrilha Sentado','PANTURRILHA'),
('Abdominal','ABDOMEN'),('Abdominal Bicicleta','ABDOMEN'),('Prancha','ABDOMEN'),
('Prancha Lateral','ABDOMEN'),('Elevação de Pernas','ABDOMEN'),('Rotação Russa','ABDOMEN'),
('Burpee','FUNCIONAL'),('Mountain Climber','FUNCIONAL'),('Agachamento com Salto','FUNCIONAL'),
('Box Jump','FUNCIONAL'),('Kettlebell Swing','FUNCIONAL'),('Polichinelo','FUNCIONAL'),
('Corda Naval','FUNCIONAL');
