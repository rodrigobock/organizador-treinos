--liquibase formatted sql
--changeset organizador-treinos:12
ALTER TABLE users ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'STUDENT';
ALTER TABLE users ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'UNISEX';
