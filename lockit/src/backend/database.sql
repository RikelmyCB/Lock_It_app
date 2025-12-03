-- Script SQL para criar as tabelas do banco de dados Lock It
-- Execute este script no seu banco de dados MySQL na nuvem

CREATE DATABASE IF NOT EXISTS lockitdb;
USE lockitdb;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dados do usuário
CREATE TABLE IF NOT EXISTS user_data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note_key TEXT,
    note_value TEXT,
    password_key TEXT,
    pass_title TEXT,
    email TEXT,
    email_title TEXT,
    keycard_title TEXT,
    keycard_name TEXT,
    keycard_number TEXT,
    keycard_data TEXT,
    security_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

