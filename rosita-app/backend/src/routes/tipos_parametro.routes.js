// server/src/routes/tipos_parametro.routes.js
import { Router } from 'express';
import { tiposParametroController } from '../controllers/tipos_parametro.controller.js';

const router = Router();

router.get('/', tiposParametroController.getAll);
router.get('/tipo/:tipo', tiposParametroController.getByTipo);
router.get('/horarios-misa', tiposParametroController.getHorariosMisa);
router.get('/motivos-misa', tiposParametroController.getMotivosMisa);
router.get('/parroquias', tiposParametroController.getParroquias);
router.get('/tipos-evento', tiposParametroController.getTiposEvento);
router.get('/estados-evento', tiposParametroController.getEstadosEvento);

export default router;