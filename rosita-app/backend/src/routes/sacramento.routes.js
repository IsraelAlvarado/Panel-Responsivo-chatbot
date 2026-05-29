// server/src/routes/sacramento.routes.js
import { Router } from 'express';
import { sacramentoController } from '../controllers/sacramento.controller.js';

const router = Router();

router.get('/', sacramentoController.getAll);
router.get('/:id', sacramentoController.getById);
router.post('/', sacramentoController.create);
router.put('/:id', sacramentoController.update);
router.delete('/:id', sacramentoController.delete);

export default router;