--liquibase formatted sql

--changeset organizador-treinos:8
ALTER TABLE workout_shares ADD COLUMN last_accessed_at TIMESTAMP;
