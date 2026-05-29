import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config/env.js';
import { initializeDatabase, shutdownDatabase } from './services/databaseInit.service.js';
import { establishSSHTunnel, closeSSHTunnel } from './services/sshTunnel.service.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = config.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Logging - COMENTADO para evitar saturacion
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: { 
      type: 'MariaDB', 
      connected: true,
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME
    },
    ssh: {
      configured: !!config.SSH_HOST,
      tunnelActive: true
    },
    botpress: {
      configured: !!config.BOTPRESS_TOKEN && !!config.BOTPRESS_BOT_ID,
      url: config.BOTPRESS_URL
    },
    onesignal: {
      configured: !!config.ONESIGNAL_REST_API_KEY,
      appId: config.ONESIGNAL_APP_ID
    }
  });
});

// API routes - DEBE IR ANTES de los archivos estaticos
app.use('/api', apiRoutes);

// Buscar frontend en multiples rutas posibles
const possiblePaths = [
  path.join(__dirname, '../public'),                              
  path.join(__dirname, '../../Rosita/dist/frontend/browser'),    
  path.join(__dirname, '../../frontend/dist/frontend/browser'),   
  path.join(__dirname, '../../../Rosita/dist/frontend/browser'),
  path.join(__dirname, '../../Rosita/dist/frontend'),           
  path.join(__dirname, '../../../Rosita/dist/frontend/browser'), 
  path.join(__dirname, '../../../../Rosita/dist/frontend/browser'), 
];

let publicPath = null;
for (const p of possiblePaths) {
  // console.log(`[Server] Buscando frontend en: ${p}`);
  if (fs.existsSync(path.join(p, 'index.html'))) {
    publicPath = p;
    // console.log(`[Server] Frontend encontrado en: ${p}`);
    break;
  }
}

if (publicPath) {
  // Servir archivos estaticos
  app.use(express.static(publicPath));
  
  // SPA catch-all
  app.get('*', (req, res) => {
    // No interceptar rutas API
    if (req.url.startsWith('/api') || req.url === '/health') {
      return res.status(404).json({ error: 'Ruta API no encontrada' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // console.log('[Server] Frontend no encontrado, sirviendo solo API');
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Rosita Backend API',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api'
      }
    });
  });
}

// Error handler 500
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// 404 final
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

async function startServer() {
  try {
    // Establecer tunel SSH si esta configurado
    if (config.SSH_HOST) {
      await establishSSHTunnel();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      if (publicPath) {
        console.log(`Frontend servido desde: ${publicPath}`);
      }
    });
    
  } catch (error) {
    console.error('Error iniciando servidor:', error.message);
    try {
      closeSSHTunnel();
    } catch (e) {}
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Cerrando servidor (SIGINT)...');
  await shutdownDatabase();
  closeSSHTunnel();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] Cerrando servidor (SIGTERM)...');
  await shutdownDatabase();
  closeSSHTunnel();
  process.exit(0);
});

startServer();

export default app;