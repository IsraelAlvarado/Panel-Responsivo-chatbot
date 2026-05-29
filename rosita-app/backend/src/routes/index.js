// server/src/routes/index.js
import { Router } from 'express';
import faqRoutes from './faq.routes.js';
import grupoRoutes from './grupo.routes.js';
import inscripcionRoutes from './inscripcion.routes.js';
import intencionRoutes from './intencion.routes.js';
import usuarioRoutes from './usuario.routes.js';
import sacramentoRoutes from './sacramento.routes.js';
import botpressRoutes from './botpress.routes.js';
import feligresRoutes from './feligres.routes.js';
import onesignalRoutes from './onesignal.routes.js'; 
import eventoRoutes from './evento.routes.js';
import tiposParametroRoutes from './tipos_parametro.routes.js'; 
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/faqs', faqRoutes);
router.use('/grupos', grupoRoutes);
router.use('/inscripciones', inscripcionRoutes);
router.use('/intenciones', intencionRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/sacramentos', sacramentoRoutes);
router.use('/botpress', botpressRoutes);
router.use('/feligreses', feligresRoutes);
router.use('/onesignal', onesignalRoutes); 
router.use('/eventos', eventoRoutes);
router.use('/tipos-parametros', tiposParametroRoutes); 
router.use('/dashboard', dashboardRoutes);

export default router;