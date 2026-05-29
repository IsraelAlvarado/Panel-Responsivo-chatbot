// server/src/models/onesignal.model.js
import { pool, parseJSON } from '../config/database.js';

export class NotificacionModel {
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones_push ORDER BY created_at DESC'
    );
    return rows.map(row => ({
      ...row,
      datos_extras: parseJSON(row.datos_extras),
      onesignal_data: parseJSON(row.onesignal_data)
    }));
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones_push WHERE id_notificacion = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      datos_extras: parseJSON(rows[0].datos_extras),
      onesignal_data: parseJSON(rows[0].onesignal_data)
    };
  }

  static async findByOneSignalTemplateId(templateId) {
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones_push WHERE onesignal_template_id = ?',
      [templateId]
    );
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      datos_extras: parseJSON(rows[0].datos_extras),
      onesignal_data: parseJSON(rows[0].onesignal_data)
    };
  }

  static async create(data) {
    const {
      titulo,
      mensaje,
      tipo = 'general',
      segmento = 'todos',
      datos_extras = {},
      imagen_url = null,
      enlace = null,
      estado = 'borrador',
      fecha_programada = null,
      creado_por = null,
      onesignal_template_id = null,
      onesignal_data = {}
    } = data;

    const [result] = await pool.query(
      `INSERT INTO notificaciones_push 
       (titulo, mensaje, tipo, segmento, datos_extras, imagen_url, enlace, estado, fecha_programada, creado_por, onesignal_template_id, onesignal_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        mensaje,
        tipo,
        segmento,
        JSON.stringify(datos_extras),
        imagen_url,
        enlace,
        estado,
        fecha_programada,
        creado_por,
        onesignal_template_id,
        JSON.stringify(onesignal_data)
      ]
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const updates = [];
    const values = [];

    const fields = [
      'titulo', 'mensaje', 'tipo', 'segmento', 'datos_extras',
      'imagen_url', 'enlace', 'fecha_programada', 'estado',
      'onesignal_template_id', 'onesignal_data'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(
          (field === 'datos_extras' || field === 'onesignal_data') 
            ? JSON.stringify(data[field]) 
            : data[field]
        );
      }
    });

    if (updates.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE notificaciones_push SET ${updates.join(', ')} WHERE id_notificacion = ?`,
      values
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM notificaciones_push WHERE id_notificacion = ?', [id]);
    return { id };
  }

  static async updateEstado(id, estado) {
    await pool.query(
      'UPDATE notificaciones_push SET estado = ? WHERE id_notificacion = ?',
      [estado, id]
    );
    return this.findById(id);
  }

  static async updateEnviada(id, onesignalNotificationId) {
    await pool.query(
      `UPDATE notificaciones_push 
       SET estado = 'enviada', enviada_at = NOW(), onesignal_notification_id = ? 
       WHERE id_notificacion = ?`,
      [onesignalNotificationId, id]
    );
    return this.findById(id);
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'enviada' THEN 1 ELSE 0 END) as enviadas,
        SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estado = 'borrador' THEN 1 ELSE 0 END) as borradores
      FROM notificaciones_push
    `);
    return rows[0];
  }

  static async findProgramadasPendientes() {
    const [rows] = await pool.query(`
      SELECT * FROM notificaciones_push 
      WHERE estado = 'programada' 
      AND fecha_programada <= NOW()
      ORDER BY fecha_programada ASC
    `);
    return rows.map(row => ({
      ...row,
      datos_extras: parseJSON(row.datos_extras),
      onesignal_data: parseJSON(row.onesignal_data)
    }));
  }
}