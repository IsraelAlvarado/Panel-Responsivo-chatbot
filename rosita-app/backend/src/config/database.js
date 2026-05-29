import mysql from 'mysql2/promise';
import { config as envConfig } from './env.js';
import { establishSSHTunnel, closeSSHTunnel } from '../services/sshTunnel.service.js';

let pool = null;
let tunnelEstablished = false;

async function ensureTunnelAndPool() {
  if (!tunnelEstablished && envConfig.SSH_HOST) {
    try {
      const tunnelActive = await establishSSHTunnel();
      if (!tunnelActive) {
        throw new Error('No se pudo establecer el tunel SSH');
      }
      tunnelEstablished = true;
    } catch (error) {
      console.error('[Database] Error al establecer tunel SSH:', error.message);
      throw error;
    }
  }

  if (!pool) {
    const poolConfig = {
      host: envConfig.DB_HOST,
      port: parseInt(envConfig.DB_PORT),
      user: envConfig.DB_USER,
      password: envConfig.DB_PASSWORD,
      database: envConfig.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 20000
    };

    pool = mysql.createPool(poolConfig);
  }

  return pool;
}

const initPromise = ensureTunnelAndPool().catch(err => {
  console.error('[Database] Error en inicialización:', err.message);
});

export { pool };

export async function getPool() {
  await initPromise;
  return pool;
}

export async function testConnection() {
  let connection;
  try {
    await getPool();
    connection = await pool.getConnection();
    return true;
  } catch (error) {
    console.error('[Database] Error de conexion:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export async function tableExists(tableName) {
  try {
    await getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = ? AND table_name = ?`,
      [envConfig.DB_NAME, tableName]
    );
    return rows[0].count > 0;
  } catch (error) {
    return false;
  }
}

export function parseJSON(field) {
  if (field === null || field === undefined) return null;
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch {
    return field;
  }
}

export async function closeDatabaseConnections() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  
  closeSSHTunnel();
  tunnelEstablished = false;
}