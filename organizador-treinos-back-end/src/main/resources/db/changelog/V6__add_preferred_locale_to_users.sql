--liquibase formatted sql

--changeset organizador-treinos:6
ALTER TABLE users ADD COLUMN preferred_locale VARCHAR(10) NOT NULL DEFAULT 'pt-BR';
