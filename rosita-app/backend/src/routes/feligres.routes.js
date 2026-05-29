// server/src/routes/feligres.routes.js
import { Router } from 'express';
import { feligresController } from '../controllers/feligres.controller.js';

const router = Router();

router.get('/', feligresController.getAll);
router.get('/search', feligresController.search);
router.get('/cedula/:cedula', feligresController.getByCedula);
router.get('/:id', feligresController.getById);
router.post('/', feligresController.create);
router.put('/:id', feligresController.update);
router.delete('/:id', feligresController.delete);

export default router;