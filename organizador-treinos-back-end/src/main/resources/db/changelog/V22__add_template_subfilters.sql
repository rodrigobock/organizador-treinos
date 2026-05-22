--liquibase formatted sql
--changeset organizador-treinos:22

ALTER TABLE workout_templates ADD COLUMN muscle_group VARCHAR(50);
ALTER TABLE workout_templates ADD COLUMN equipment_required VARCHAR(50);
ALTER TABLE workout_templates ADD COLUMN estimated_duration INTEGER;
ALTER TABLE workout_templates ADD COLUMN weekly_frequency INTEGER;

CREATE INDEX idx_workout_templates_muscle_group ON workout_templates(muscle_group);
CREATE INDEX idx_workout_templates_equipment ON workout_templates(equipment_required);

-- Recategorizar: PPL (todos) → HYPERTROPHY
UPDATE workout_templates SET category = 'HYPERTROPHY' WHERE name IN (
    'PPL - Push (Peito, Ombro, Tríceps)',
    'PPL - Pull (Costas, Bíceps)',
    'PPL - Legs (Pernas)',
    'PPL Avançado - Push',
    'PPL Avançado - Pull',
    'PPL Avançado - Legs',
    'GVT - Volume Alemão',
    'Corpo Inteiro - Avançado Feminino'
);

-- Recategorizar: Powerlifting + Pernas Avançado → STRENGTH
UPDATE workout_templates SET category = 'STRENGTH' WHERE name IN (
    'Powerlifting - Treino A',
    'Powerlifting - Treino B',
    'Pernas - Avançado Masculino'
);

-- Recategorizar: HIIT → CARDIO
UPDATE workout_templates SET category = 'CARDIO' WHERE name = 'HIIT Calistenia';

-- Recategorizar: Flexibilidade → MOBILITY
UPDATE workout_templates SET category = 'MOBILITY' WHERE name = 'Flexibilidade e Mobilidade';

-- muscle_group: CHEST
UPDATE workout_templates SET muscle_group = 'CHEST' WHERE name IN (
    'PPL - Push (Peito, Ombro, Tríceps)',
    'PPL Avançado - Push',
    'Peito e Tríceps - Intermediário Masculino',
    'Peito e Tríceps - Iniciante Masculino'
);

-- muscle_group: BACK
UPDATE workout_templates SET muscle_group = 'BACK' WHERE name IN (
    'PPL - Pull (Costas, Bíceps)',
    'PPL Avançado - Pull',
    'Costas e Bíceps - Intermediário Masculino'
);

-- muscle_group: LEGS
UPDATE workout_templates SET muscle_group = 'LEGS' WHERE name IN (
    'PPL - Legs (Pernas)',
    'PPL Avançado - Legs',
    'Lower Body (Parte Inferior)',
    'Pernas - Avançado Masculino'
);

-- muscle_group: UPPER_BODY
UPDATE workout_templates SET muscle_group = 'UPPER_BODY' WHERE name IN (
    'Upper Body (Parte Superior)',
    'GVT - Volume Alemão',
    'Calistenia Superior'
);

-- muscle_group: LOWER_BODY
UPDATE workout_templates SET muscle_group = 'LOWER_BODY' WHERE name = 'Powerlifting - Treino A';

-- muscle_group: GLUTES
UPDATE workout_templates SET muscle_group = 'GLUTES' WHERE name IN (
    'Glúteos e Pernas - Iniciante Feminino',
    'Glúteos e Pernas - Intermediário Feminino'
);

-- muscle_group: SHOULDERS
UPDATE workout_templates SET muscle_group = 'SHOULDERS' WHERE name = 'Ombros e Trapézio - Masculino';

-- muscle_group: CORE
UPDATE workout_templates SET muscle_group = 'CORE' WHERE name = 'Abdômen e Core - Feminino';

-- muscle_group: FULL_BODY para todos os demais
UPDATE workout_templates SET muscle_group = 'FULL_BODY' WHERE muscle_group IS NULL;

-- equipment_required: BODYWEIGHT
UPDATE workout_templates SET equipment_required = 'BODYWEIGHT' WHERE name IN (
    'Calistenia Iniciante',
    'Calistenia Intermediario',
    'HIIT Calistenia',
    'Calistenia Superior',
    'Flexibilidade e Mobilidade',
    'Abdômen e Core - Feminino'
);

-- equipment_required: DUMBBELLS
UPDATE workout_templates SET equipment_required = 'DUMBBELLS' WHERE name IN (
    'Full Body Iniciante',
    'Peito e Tríceps - Iniciante Masculino'
);

-- equipment_required: KETTLEBELL
UPDATE workout_templates SET equipment_required = 'KETTLEBELL' WHERE name = 'Treino Funcional';

-- equipment_required: MACHINES
UPDATE workout_templates SET equipment_required = 'MACHINES' WHERE name = 'Glúteos e Pernas - Iniciante Feminino';

-- equipment_required: FULL_GYM para todos os demais
UPDATE workout_templates SET equipment_required = 'FULL_GYM' WHERE equipment_required IS NULL;

-- estimated_duration (minutos)
UPDATE workout_templates SET estimated_duration = 30 WHERE name IN (
    'Calistenia Iniciante', 'HIIT Calistenia', 'Flexibilidade e Mobilidade', 'Abdômen e Core - Feminino'
);
UPDATE workout_templates SET estimated_duration = 40 WHERE name IN (
    'Full Body Iniciante', 'Peito e Tríceps - Iniciante Masculino', 'Glúteos e Pernas - Iniciante Feminino'
);
UPDATE workout_templates SET estimated_duration = 45 WHERE name IN (
    'Treino Funcional', 'Calistenia Intermediario', 'Calistenia Superior'
);
UPDATE workout_templates SET estimated_duration = 55 WHERE name = 'Ombros e Trapézio - Masculino';
UPDATE workout_templates SET estimated_duration = 60 WHERE name IN (
    'PPL - Push (Peito, Ombro, Tríceps)',
    'PPL - Pull (Costas, Bíceps)',
    'PPL - Legs (Pernas)',
    'Upper Body (Parte Superior)',
    'Lower Body (Parte Inferior)',
    'Full Body Feminino - Intermediário',
    'Peito e Tríceps - Intermediário Masculino',
    'Costas e Bíceps - Intermediário Masculino',
    'Glúteos e Pernas - Intermediário Feminino'
);
UPDATE workout_templates SET estimated_duration = 75 WHERE name IN (
    'PPL Avançado - Push',
    'PPL Avançado - Pull',
    'PPL Avançado - Legs',
    'Corpo Inteiro - Avançado Feminino',
    'Pernas - Avançado Masculino'
);
UPDATE workout_templates SET estimated_duration = 90 WHERE name IN (
    'GVT - Volume Alemão', 'Powerlifting - Treino A', 'Powerlifting - Treino B'
);

-- weekly_frequency
UPDATE workout_templates SET weekly_frequency = 2 WHERE name IN (
    'Powerlifting - Treino A', 'Powerlifting - Treino B'
);
UPDATE workout_templates SET weekly_frequency = 3 WHERE weekly_frequency IS NULL;
