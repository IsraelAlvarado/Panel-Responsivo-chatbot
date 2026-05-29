// server/src/routes/botpress.routes.js
import { Router } from 'express';
import { botpressController } from '../controllers/botpress.controller.js';

const router = Router();

router.get('/conversations', botpressController.getConversations);
router.get('/conversations/:conversationId/messages', botpressController.getMessages);
router.post('/conversations/:conversationId/messages', botpressController.sendMessage);
router.delete('/conversations/:conversationId', botpressController.deleteConversation);

export default router;