// server/src/routes/evento.routes.js
import { Router } from 'express';
import { eventoController } from '../controllers/evento.controller.js';

const router = Router();

router.get('/', eventoController.getAll);
router.get('/estadisticas/general', eventoController.getEstadisticas);
router.get('/proximos/:dias?', eventoController.getProximos);
router.get('/tipo/:tipo', eventoController.getByTipo);
router.get('/fecha/:fecha', eventoController.getByFecha);
router.get('/estado/:estado', eventoController.getByEstado);
router.post('/search', eventoController.search);
router.get('/:id', eventoController.getById);
router.post('/', eventoController.create);
router.put('/:id', eventoController.update);
router.delete('/:id', eventoController.delete);

export default router;