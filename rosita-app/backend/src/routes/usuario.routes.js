// server/src/routes/usuario.routes.js
import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';

const router = Router();

router.get('/', usuarioController.getAll);
router.get('/correo/:correo', usuarioController.getByCorreo);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;