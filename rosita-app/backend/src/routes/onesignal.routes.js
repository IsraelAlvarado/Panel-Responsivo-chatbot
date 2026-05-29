// server/src/routes/onesignal.routes.js
import { Router } from 'express';
import { OneSignalController } from '../controllers/onesignal.controller.js';

const router = Router();

router.get('/templates', OneSignalController.getTemplates);
router.get('/templates/:templateId', OneSignalController.getTemplateById);
router.post('/templates', OneSignalController.createTemplate);
router.put('/templates/:templateId', OneSignalController.updateTemplate);
router.delete('/templates/:templateId', OneSignalController.deleteTemplate);
router.post('/send-to-all', OneSignalController.sendToAll);
router.post('/send-external', OneSignalController.sendToExternalId);

export default router;