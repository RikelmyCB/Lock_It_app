import 'dotenv/config';

import express from 'express';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';



const app = express();

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Monta as rotas
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Usa o middleware de erro. Deve ser o último middleware a ser adicionado.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});