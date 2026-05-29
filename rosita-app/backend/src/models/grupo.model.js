// server/src/models/grupo.model.js
import { pool } from '../config/database.js';

export const grupoQueries = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
        g.*,
        COUNT(i.id_inscripcion) as total_inscritos,
        SUM(CASE WHEN i.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
      FROM grupos_parroquiales g
      LEFT JOIN inscripciones i ON g.id_grupo = i.grupo_id 
        AND i.tipo_servicio = 'grupo_parroquial'
        AND i.estado != 'cancelada'
      GROUP BY g.id_grupo
      ORDER BY g.id_grupo DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        g.*,
        COUNT(i.id_inscripcion) as total_inscritos,
        SUM(CASE WHEN i.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
       FROM grupos_parroquiales g
       LEFT JOIN inscripciones i ON g.id_grupo = i.grupo_id 
         AND i.tipo_servicio = 'grupo_parroquial'
         AND i.estado != 'cancelada'
       WHERE g.id_grupo = ?
       GROUP BY g.id_grupo`, 
      [id]
    );
    return rows[0];
  },

  create: async (grupo) => {
    const [result] = await pool.query(
      `INSERT INTO grupos_parroquiales (nombre_grupo, descripcion, horario_reunion, requisitos) 
       VALUES (?, ?, ?, ?)`,
      [
        grupo.nombre_grupo, 
        grupo.descripcion, 
        grupo.horario_reunion, 
        grupo.requisitos
      ]
    );
    return grupoQueries.getById(result.insertId);
  },

  update: async (id, grupo) => {
    const updates = [];
    const values = [];
    
    const fields = ['nombre_grupo', 'descripcion', 'horario_reunion', 'requisitos'];
    
    fields.forEach(field => {
      if (grupo[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(grupo[field]);
      }
    });
    
    if (updates.length === 0) return null;
    
    values.push(id);
    await pool.query(
      `UPDATE grupos_parroquiales SET ${updates.join(', ')} WHERE id_grupo = ?`,
      values
    );
    return grupoQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM grupos_parroquiales WHERE id_grupo = ?', [id]);
  }
};