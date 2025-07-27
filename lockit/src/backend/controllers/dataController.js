import asyncHandler from 'express-async-handler';
import db from '../config/db.js';
import { encrypt, decrypt } from '../config/crypto.js';

// Mapeia os tipos do frontend para os campos do banco de dados
const dataTypeMapping = {
  nota: ['note_key', 'note_value'],
  senha: ['pass_title', 'password_key'],
  email: ['email_title', 'email'],
  cartao: ['keycard_title', 'keycard_name', 'keycard_number', 'keycard_data', 'security_code'],
};

// POST /api/data
export const createData = asyncHandler(async (req, res) => {
  const { dataType, ...data } = req.body; // Pega o tipo e o resto dos dados
  const userId = req.userId;

  if (!dataType || !dataTypeMapping[dataType]) {
    res.status(400);
    throw new Error('Tipo de dado inválido ou não fornecido.');
  }

  const fields = dataTypeMapping[dataType];
  const encryptedData = {};

  for (const field of fields) {
    if (!data[field]) {
      res.status(400);
      throw new Error(`Campo obrigatório '${field}' não fornecido para o tipo '${dataType}'.`);
    }
    encryptedData[field] = encrypt(data[field]);
  }

  const queryFields = ['user_id', 'data_type', ...Object.keys(encryptedData)];
  const queryValues = [userId, dataType, ...Object.values(encryptedData)];
  const placeholders = queryFields.map(() => '?').join(', ');

  const sql = `INSERT INTO user_data (${queryFields.join(', ')}) VALUES (${placeholders})`;

  await db.query(sql, queryValues);

  res.status(201).json({ message: 'Dado salvo com sucesso.' });
});

// GET /api/data?type=...
export const getAllData = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const userId = req.userId;

    if (!type || !dataTypeMapping[type]) {
        res.status(400);
        throw new Error('Parâmetro "type" é obrigatório e deve ser válido (nota, senha, email, cartao).');
    }

    const fields = dataTypeMapping[type];
    // Adiciona o 'data_id' para ser retornado, essencial para o delete
    const queryFields = ['data_id', ...fields].join(', ');

    const sql = `SELECT ${queryFields} FROM user_data WHERE user_id = ? AND data_type = ?`;
    const [results] = await db.query(sql, [userId, type]);

    if (results.length === 0) {
        return res.status(200).json([]); // Retorna array vazio, não é um erro 404
    }

    const decryptedData = results.map(item => {
        const decryptedItem = { data_id: item.data_id };
        for (const field of fields) {
            decryptedItem[field] = decrypt(item[field]);
        }
        return decryptedItem;
    });

    res.status(200).json(decryptedData);
});


// DELETE /api/data/:id
export const deleteData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    res.status(400);
    throw new Error('ID do dado não fornecido.');
  }

  const sql = 'DELETE FROM user_data WHERE data_id = ? AND user_id = ?';
  const [result] = await db.query(sql, [id, userId]);

  if (result.affectedRows === 0) {
    res.status(404);
    throw new Error('Dado não encontrado ou não pertence ao usuário.');
  }

  res.status(200).json({ message: 'Dado excluído com sucesso.', data_id: id });
});