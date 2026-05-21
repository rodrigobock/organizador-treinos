--liquibase formatted sql
--changeset organizador-treinos:16
ALTER TABLE exercise_logs ADD COLUMN difficulty VARCHAR(20);
