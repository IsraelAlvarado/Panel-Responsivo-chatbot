// server/src/routes/faq.routes.js
import { Router } from 'express';
import { faqController } from '../controllers/faq.controller.js';

const router = Router();

router.get('/', faqController.getAll);
router.get('/category/:category', faqController.filterByCategory);
router.post('/search', faqController.search);
router.get('/:id', faqController.getById);
router.post('/', faqController.create);
router.put('/:id', faqController.update);
router.delete('/:id', faqController.delete);

export default router;