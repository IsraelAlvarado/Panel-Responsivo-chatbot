import { getPool, testConnection, tableExists, closeDatabaseConnections } from '../config/database.js';

export async function initializeDatabase() {
  let connection;

  try {
    await testConnection();
    
    const activePool = await getPool();
    connection = await activePool.getConnection();

    const requiredTables = [
      'feligres',
      'grupos_parroquiales',
      'inscripciones',
      'intenciones',
      'faqs',
      'usuario',
      'evento'
    ];
    
    for (const tableName of requiredTables) {
      await tableExists(tableName);
    }

  } catch (error) {
    console.error('[DB Init] Error:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export async function shutdownDatabase() {
  await closeDatabaseConnections();
}