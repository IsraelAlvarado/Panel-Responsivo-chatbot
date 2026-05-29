// server/src/routes/grupo.routes.js
import { Router } from 'express';
import { grupoController } from '../controllers/grupo.controller.js';

const router = Router();

router.get('/', grupoController.getAll);
router.get('/:id', grupoController.getById);
router.post('/', grupoController.create);
router.put('/:id', grupoController.update);
router.delete('/:id', grupoController.delete);

export default router;