import { getPool } from '../config/database.js';

function safeJsonParse(field) {
  if (field === null || field === undefined) return [];
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

export const DashboardModel = {
  getCurrentStats: async () => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        'SELECT * FROM dashboard WHERE fecha = CURDATE() LIMIT 1'
      );
      
      if (!rows || rows.length === 0) {
        console.log('[DashboardModel] No hay stats para hoy');
        return null;
      }
      
      const row = rows[0];
      
      return {
        id: row.id,
        fecha: row.fecha,
        hora: row.hora,
        total_chats: row.total_chats,
        chats_completados: row.chats_completados,
        chats_pendientes: row.chats_pendientes,
        usuarios_activos_7d: row.usuarios_activos_7d,
        tasa_resolucion: row.tasa_resolucion,
        actividad_semanal: safeJsonParse(row.actividad_semanal),
        top_consultas: safeJsonParse(row.top_consultas),
        conversaciones_ids: safeJsonParse(row.conversaciones_ids),
        ultima_sincronizacion: row.ultima_sincronizacion
      };
    } catch (error) {
      console.error('[DashboardModel] Error getCurrentStats:', error);
      return null;
    }
  },

  saveSync: async (stats, previousIds = []) => {
    const pool = await getPool();
    const currentIds = stats.conversationIds || [];
    
    const nuevas = currentIds.filter(id => !previousIds.includes(id));
    const eliminadas = previousIds.filter(id => !currentIds.includes(id));
    
    const tasaResolucion = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(2) : 0;
    
    const actividadSemanalJson = JSON.stringify(stats.weeklyActivity || []);
    const topConsultasJson = JSON.stringify(stats.topConsultations || []);
    const conversacionesIdsJson = JSON.stringify(currentIds);
    
    console.log('[DashboardModel] Preparando guardar:', {
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().split(' ')[0],
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      activeUsers: stats.activeUsers,
      tasaResolucion: tasaResolucion,
      actividadLength: actividadSemanalJson.length,
      topConsultasLength: topConsultasJson.length,
      idsCount: currentIds.length
    });

    try {
      const [existing] = await pool.query(
        'SELECT id FROM dashboard WHERE fecha = CURDATE() LIMIT 1'
      );
      
      let result;
      
      if (existing && existing.length > 0) {
        console.log('[DashboardModel] Actualizando registro existente, id:', existing[0].id);
        
        const [updateResult] = await pool.query(
          `UPDATE dashboard SET 
            hora = CURTIME(),
            total_chats = ?,
            chats_completados = ?,
            chats_pendientes = ?,
            usuarios_activos_7d = ?,
            tasa_resolucion = ?,
            actividad_semanal = ?,
            top_consultas = ?,
            conversaciones_ids = ?,
            ultima_sincronizacion = CURRENT_TIMESTAMP
           WHERE fecha = CURDATE()`,
          [
            stats.total,
            stats.completed,
            stats.pending,
            stats.activeUsers,
            tasaResolucion,
            actividadSemanalJson,
            topConsultasJson,
            conversacionesIdsJson
          ]
        );
        result = updateResult;
      } else {
        console.log('[DashboardModel] Insertando nuevo registro');
        
        const [insertResult] = await pool.query(
          `INSERT INTO dashboard 
            (fecha, hora, total_chats, chats_completados, chats_pendientes, 
             usuarios_activos_7d, tasa_resolucion, actividad_semanal, top_consultas, conversaciones_ids)
           VALUES 
            (CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            stats.total,
            stats.completed,
            stats.pending,
            stats.activeUsers,
            tasaResolucion,
            actividadSemanalJson,
            topConsultasJson,
            conversacionesIdsJson
          ]
        );
        result = insertResult;
      }
      
      console.log('[DashboardModel] Resultado:', {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        changedRows: result.changedRows
      });
      
      if (nuevas.length > 0 || eliminadas.length > 0) {
        await DashboardModel.logSyncChange({
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0],
          total_anterior: previousIds.length,
          total_nuevo: currentIds.length,
          diferencia: currentIds.length - previousIds.length,
          conversaciones_nuevas: nuevas,
          conversaciones_eliminadas: eliminadas
        });
      }

      return result;
    } catch (error) {
      console.error('[DashboardModel] Error saveSync:', error);
      throw error;
    }
  },

  logSyncChange: async (logData) => {
    try {
      const pool = await getPool();
      const horaStr = logData.hora ? logData.hora.substring(0, 8) : '00:00:00';
      
      await pool.query(
        `INSERT INTO dashboard_sync_log 
         (fecha, hora, total_anterior, total_nuevo, diferencia, conversaciones_nuevas, conversaciones_eliminadas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          logData.fecha,
          horaStr,
          logData.total_anterior,
          logData.total_nuevo,
          logData.diferencia,
          JSON.stringify(logData.conversaciones_nuevas),
          JSON.stringify(logData.conversaciones_eliminadas)
        ]
      );
      console.log('[DashboardModel] Cambio logueado');
    } catch (error) {
      console.error('[DashboardModel] Error logSyncChange:', error);
    }
  },

  saveDailyHistory: async (stats) => {
    try {
      const pool = await getPool();
      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const diaSemana = diasSemana[new Date().getDay()];
      
      const conversacionesSnapshot = JSON.stringify(stats.conversationIds || []);
      
      const [existing] = await pool.query(
        'SELECT id FROM dashboard_historial_diario WHERE fecha = CURDATE() LIMIT 1'
      );
      
      if (existing && existing.length > 0) {
        await pool.query(
          `UPDATE dashboard_historial_diario SET 
            dia_semana = ?,
            total_chats = ?,
            completados = ?,
            pendientes = ?,
            usuarios_activos = ?,
            conversaciones_snapshot = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE fecha = CURDATE()`,
          [
            diaSemana,
            stats.total,
            stats.completed,
            stats.pending,
            stats.activeUsers,
            conversacionesSnapshot
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO dashboard_historial_diario 
            (fecha, dia_semana, total_chats, completados, pendientes, usuarios_activos, conversaciones_snapshot)
           VALUES 
            (CURDATE(), ?, ?, ?, ?, ?, ?)`,
          [
            diaSemana,
            stats.total,
            stats.completed,
            stats.pending,
            stats.activeUsers,
            conversacionesSnapshot
          ]
        );
      }
      
      console.log('[DashboardModel] Historial diario guardado');
    } catch (error) {
      console.error('[DashboardModel] Error saveDailyHistory:', error);
      throw error;
    }
  }
};