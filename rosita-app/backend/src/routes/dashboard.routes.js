import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', dashboardController.getStats);
router.get('/sync-history', dashboardController.getSyncHistory);

export default router;