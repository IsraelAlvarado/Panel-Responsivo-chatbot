// server/src/routes/inscripcion.routes.js
import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcion.controller.js';

const router = Router();

router.get('/', inscripcionController.getAll);
router.get('/estadisticas/general', inscripcionController.getEstadisticas);
router.get('/tipo/:tipo', inscripcionController.getByTipo);
router.get('/grupo/:grupoId', inscripcionController.getByGrupo);
router.get('/:id', inscripcionController.getById);
router.post('/', inscripcionController.create);
router.put('/:id', inscripcionController.update);
router.delete('/:id', inscripcionController.delete);

export default router;