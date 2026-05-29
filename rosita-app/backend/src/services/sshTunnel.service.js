import { Client } from 'ssh2';
import net from 'net';
import { config } from '../config/env.js';

let sshClient = null;
let server = null;
let tunnelActive = false;
let tunnelStarting = false;  
let tunnelCheckInterval = null;

function checkLocalPort(port) {
  return new Promise((resolve) => {
    const tester = net.createConnection({ port, host: '127.0.0.1', timeout: 3000 });
    
    tester.on('connect', () => {
      tester.end();
      resolve(true);
    });
    
    tester.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      tester.destroy();
      resolve(false);
    }, 2000);
  });
}

export async function establishSSHTunnel() {
  if (tunnelActive) {
    const portAlive = await checkLocalPort(config.DB_PORT);
    if (portAlive) {
      return true;
    } else {
      tunnelActive = false;
    }
  }

  if (tunnelStarting) {
    console.log('[SSH] Inicialización en progreso, esperando...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    return establishSSHTunnel(); 
  }

  if (!config.SSH_HOST) {
    tunnelActive = true;
    return true;
  }

  tunnelStarting = true;  

  try {
    const portAlive = await checkLocalPort(config.DB_PORT);
    if (portAlive) {
      console.log('[SSH] Puerto ya está en uso, asumiendo túnel existente');
      tunnelActive = true;
      tunnelStarting = false;
      startHealthCheck();
      return true;
    }

    await createTunnel();
    tunnelActive = true;
    tunnelStarting = false;
    startHealthCheck();
    return true;

  } catch (error) {
    tunnelStarting = false;
    tunnelActive = false;
    throw error;
  }
}

function createTunnel() {
  return new Promise((resolve, reject) => {
    sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('[SSH] Conexión SSH lista');

      server = net.createServer((sock) => {
        sshClient.forwardOut(
          sock.remoteAddress || '127.0.0.1',
          sock.remotePort || 0,
          '127.0.0.1',
          3306,
          (err, stream) => {
            if (err) {
              console.error('[SSH] Error en forwardOut:', err.message);
              sock.end();
              return;
            }
            sock.pipe(stream).pipe(sock);
          }
        );
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log('[SSH] Puerto ya en uso, reutilizando túnel existente');
          tunnelActive = true;
          resolve(true);
        } else {
          console.error('[SSH] Error del servidor:', err.message);
          reject(err);
        }
      });

      server.listen(config.DB_PORT, '127.0.0.1', () => {
        console.log(`[SSH] Túnel activo en 127.0.0.1:${config.DB_PORT} → 127.0.0.1:3306 (remoto)`);
        resolve(true);
      });
    });

    sshClient.on('error', (err) => {
      console.error('[SSH] Error de conexión:', err.message);
      reject(err);
    });

    sshClient.on('close', () => {
      console.log('[SSH] Conexión cerrada');
      tunnelActive = false;
    });

    sshClient.connect({
      host: config.SSH_HOST,
      port: config.SSH_PORT,
      username: config.SSH_USERNAME,
      password: config.SSH_PASSWORD,
      readyTimeout: 20000,
      keepaliveInterval: 30000
    });
  });
}

function startHealthCheck() {
  if (tunnelCheckInterval) {
    clearInterval(tunnelCheckInterval);
  }

  tunnelCheckInterval = setInterval(async () => {
    if (!tunnelActive) return;

    const portAlive = await checkLocalPort(config.DB_PORT);
    if (!portAlive) {
      console.log('[SSH] Túnel no responde, marcando como inactivo');
      tunnelActive = false;
    }
  }, 30000);
}

export function closeSSHTunnel() {
  if (tunnelCheckInterval) {
    clearInterval(tunnelCheckInterval);
    tunnelCheckInterval = null;
  }

  if (server) {
    try {
      server.close();
    } catch (e) {}
    server = null;
  }

  if (sshClient) {
    try {
      sshClient.end();
    } catch (e) {}
    sshClient = null;
  }

  tunnelActive = false;
  tunnelStarting = false;
  console.log('[SSH] Túnel cerrado');
}

export function isTunnelActive() {
  return tunnelActive;
}