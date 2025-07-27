import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import db from '../config/db.js'; // Usando a conexão com o banco de dados

// Função auxiliar para gerar o Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '150d' });
};

/**
 * @desc    Registra um novo usuário
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validação dos campos
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Por favor, preencha todos os campos.');
  }

  // 2. Verificar se o usuário já existe (pelo email ou username)
  const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ? OR username = ?', [email, username]);

  if (existingUsers.length > 0) {
    res.status(409); // Conflict
    throw new Error('Usuário já existe. Por favor, escolha outro email ou nome de usuário.');
  }

  // 3. Criptografar a senha antes de salvar
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Inserir o novo usuário no banco de dados
  const [result] = await db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  // 5. Verificar se a inserção foi bem-sucedida e responder
  if (result.insertId) {
    const newUserId = result.insertId;
    res.status(201).json({
      message: 'Usuário registrado com sucesso.',
      token: generateToken(newUserId),
      username: username,
      user_id: newUserId,
    });
  } else {
    res.status(500);
    throw new Error('Erro ao registrar o usuário. Por favor, tente novamente.');
  }
});


/**
 * @desc    Autentica (login) um usuário
 * @route   POST /api/auth/login
 * @access  Public
 */


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor, preencha todos os campos.');
  }

  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      message: 'Login realizado com sucesso.',
      token: generateToken(user.user_id),
      username: user.username,
      user_id: user.user_id,
    });
  } else {
    res.status(401);
    throw new Error('Email ou senha inválidos.');
  }
});