// server/src/routes/intencion.routes.js
import { Router } from 'express';
import { intencionController } from '../controllers/intencion.controller.js';

const router = Router();

router.get('/', intencionController.getAll);
router.get('/estadisticas/general', intencionController.getEstadisticas);
router.get('/estadisticas/mensual', intencionController.getEstadisticasPorMes);
router.get('/proximas/:dias?', intencionController.getProximas);
router.get('/fecha/:fecha', intencionController.getByFecha);
router.get('/estado/:estado', intencionController.getByEstado);
router.post('/search', intencionController.search);
router.get('/:id', intencionController.getById);
router.post('/', intencionController.create);
router.put('/:id', intencionController.update);
router.delete('/:id', intencionController.delete);

export default router;