-- Criação da tabela de usuários
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- Criação da tabela de dados dos usuários
CREATE TABLE user_data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data_type VARCHAR(50), -- exemplo: 'note', 'keycard', 'email', 'password'

    -- Campos para anotações
    note_key TEXT,
    note_value TEXT,

    -- Campos para cartão
    keycard_title TEXT,
    keycard_number TEXT,
    keycard_data TEXT,
    keycard_name TEXT,
    security_code TEXT,

    -- Campos para e-mails
    email_title TEXT,
    email TEXT,

    -- Campos para senhas
    pass_title TEXT,
    password_key TEXT,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
