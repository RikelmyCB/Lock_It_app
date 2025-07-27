import express from 'express';
import { createData, getAllData, deleteData } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas as rotas aqui são protegidas e requerem um token válido.
router.use(protect);

router.route('/')
  .post(createData) // POST /api/data
  .get(getAllData); // GET /api/data?type=nota

router.route('/:id')
  .delete(deleteData); // DELETE /api/data/123

export default router;