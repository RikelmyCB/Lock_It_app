import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Pega o token do cabeçalho (formato "Bearer TOKEN")
      token = authHeader.split(' ')[1];

      // Verifica e decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adiciona o id do usuário ao objeto req para ser usado nas próximas rotas
      req.userId = decoded.id;

      next();
    } catch (error) {
      console.error('Erro na autenticação do token:', error);
      res.status(401);
      throw new Error('Não autorizado, token falhou.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Não autorizado, sem token.');
  }
});