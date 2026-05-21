--liquibase formatted sql

--changeset organizador-treinos:18

INSERT INTO exercise_catalog (name, category) VALUES

-- PEITO (adicionais)
('Supino com Halteres','PEITO'),
('Supino Inclinado com Halteres','PEITO'),
('Supino Declinado com Halteres','PEITO'),
('Fly Peitoral na Máquina','PEITO'),
('Supino na Máquina','PEITO'),
('Crossover Baixo','PEITO'),
('Crossover Alto','PEITO'),
('Dips (Peito)','PEITO'),

-- COSTAS (adicionais)
('Remada no Cabo','COSTAS'),
('Remada na Máquina','COSTAS'),
('Puxada Neutra','COSTAS'),
('Puxada Fechada','COSTAS'),
('Pullover com Halter','COSTAS'),
('Hiperextensão Lombar','COSTAS'),
('Good Morning','COSTAS'),
('Superman','COSTAS'),
('Remada T','COSTAS'),
('Remada Cavalinho','COSTAS'),

-- OMBROS (adicionais)
('Arnold Press','OMBROS'),
('Desenvolvimento Militar com Barra','OMBROS'),
('Face Pull','OMBROS'),
('Encolhimento com Barra','OMBROS'),
('Encolhimento com Halteres','OMBROS'),
('Upright Row','OMBROS'),
('Elevação Lateral na Máquina','OMBROS'),
('Desenvolvimento na Máquina','OMBROS'),

-- BICEPS (adicionais)
('Rosca com Barra EZ','BICEPS'),
('Rosca no Cabo','BICEPS'),
('Rosca Inversa','BICEPS'),
('Rosca 21','BICEPS'),
('Chin-Up (Pegada Supinada)','BICEPS'),
('Rosca com Corda no Cabo','BICEPS'),

-- TRICEPS (adicionais)
('Kickback de Tríceps','TRICEPS'),
('French Press com Halter','TRICEPS'),
('Tríceps na Polia Alta','TRICEPS'),
('Dips nas Paralelas','TRICEPS'),
('Extensão de Tríceps Overhead','TRICEPS'),
('Skull Crusher','TRICEPS'),
('Close Grip Bench Press','TRICEPS'),

-- PERNAS (adicionais)
('Passada Búlgara','PERNAS'),
('Agachamento Goblet','PERNAS'),
('Agachamento Frontal','PERNAS'),
('Sissy Squat','PERNAS'),
('Leg Press Unilateral','PERNAS'),
('Cadeira Extensora Unilateral','PERNAS'),
('Cadeira Flexora','PERNAS'),
('Deadlift Romeno','PERNAS'),
('Agachamento com Salto','PERNAS'),
('Passada Reversa','PERNAS'),
('Passo Lateral com Elástico','PERNAS'),

-- GLUTEOS (adicionais)
('Donkey Kick','GLUTEOS'),
('Fire Hydrant','GLUTEOS'),
('Abdução no Cabo','GLUTEOS'),
('Coice de Glúteo no Cabo','GLUTEOS'),
('Hip Thrust Unilateral','GLUTEOS'),
('Stiff Unilateral','GLUTEOS'),
('Levantamento Terra Romeno','GLUTEOS'),
('Agachamento no Smith','GLUTEOS'),

-- PANTURRILHA (adicionais)
('Panturrilha no Leg Press','PANTURRILHA'),
('Panturrilha com Halter','PANTURRILHA'),
('Panturrilha Unilateral','PANTURRILHA'),

-- ABDOMEN (adicionais)
('Crunch','ABDOMEN'),
('Crunch Reverso','ABDOMEN'),
('Abdominal Infra','ABDOMEN'),
('V-Up','ABDOMEN'),
('Dead Bug','ABDOMEN'),
('Dragon Flag','ABDOMEN'),
('Pallof Press','ABDOMEN'),
('Abdominal com Roda','ABDOMEN'),
('Hollow Body Hold','ABDOMEN'),
('L-Sit','ABDOMEN'),
('Sit-Up','ABDOMEN'),
('Crunch na Polia','ABDOMEN'),

-- FUNCIONAL (adicionais)
('Turkish Get-Up','FUNCIONAL'),
('Farmer Walk','FUNCIONAL'),
('Wall Ball','FUNCIONAL'),
('Thruster','FUNCIONAL'),
('Slam Ball','FUNCIONAL'),
('Push Press','FUNCIONAL'),
('Power Clean','FUNCIONAL'),
('Swing com Halter','FUNCIONAL'),
('Battle Rope','FUNCIONAL'),
('Arranco','FUNCIONAL'),
('Arremesso','FUNCIONAL'),
('Man Maker','FUNCIONAL'),

-- CARDIO
('Esteira','CARDIO'),
('Bicicleta Ergométrica','CARDIO'),
('Elíptico','CARDIO'),
('Remo Ergométrico','CARDIO'),
('Corrida','CARDIO'),
('Caminhada','CARDIO'),
('Pular Corda','CARDIO'),
('Assault Bike','CARDIO'),
('Ski Erg','CARDIO'),
('Sprints','CARDIO'),
('HIIT','CARDIO'),

-- MOBILIDADE
('Mobilização de Quadril','MOBILIDADE'),
('Mobilização de Tornozelo','MOBILIDADE'),
('Mobilização de Ombro','MOBILIDADE'),
('Rotação de Coluna Torácica','MOBILIDADE'),
('Hip 90/90','MOBILIDADE'),
('Cat-Cow','MOBILIDADE'),
('World''s Greatest Stretch','MOBILIDADE'),
('Frog Stretch','MOBILIDADE'),
('Pigeon Pose','MOBILIDADE'),
('Couch Stretch','MOBILIDADE'),

-- ALONGAMENTO
('Alongamento de Quadríceps','ALONGAMENTO'),
('Alongamento de Isquiotibiais','ALONGAMENTO'),
('Alongamento de Panturrilha','ALONGAMENTO'),
('Alongamento de Flexores do Quadril','ALONGAMENTO'),
('Alongamento de Ombros','ALONGAMENTO'),
('Alongamento de Peito','ALONGAMENTO'),
('Alongamento de Costas','ALONGAMENTO'),
('Alongamento de Pescoço','ALONGAMENTO');
