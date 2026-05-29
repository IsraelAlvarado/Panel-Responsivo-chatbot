// server/src/models/inscripcion.model.js
import { pool, parseJSON } from '../config/database.js';

export const inscripcionQueries = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             f.nombres as feligres_nombres, 
             f.apellidos as feligres_apellidos,
             f.correo as feligres_correo,
             f.cedula as feligres_cedula,
             f.fecha_nacimiento as feligres_fecha_nacimiento,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN feligres f ON i.feligres_id = f.id
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      ORDER BY i.fecha_inscripcion DESC
    `);
    return rows.map(row => ({
      ...row,
      datos_adicionales: parseJSON(row.datos_adicionales)
    }));
  },

  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             f.nombres as feligres_nombres, 
             f.apellidos as feligres_apellidos,
             f.correo as feligres_correo,
             f.cedula as feligres_cedula,
             f.fecha_nacimiento as feligres_fecha_nacimiento,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN feligres f ON i.feligres_id = f.id
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.id_inscripcion = ?
    `, [id]);
    
    if (rows[0]) {
      rows[0].datos_adicionales = parseJSON(rows[0].datos_adicionales);
    }
    return rows[0] || null;
  },

  getByFeligres: async (feligresId) => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.feligres_id = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [feligresId]);
    return rows.map(row => ({
      ...row,
      datos_adicionales: parseJSON(row.datos_adicionales)
    }));
  },

  getByGrupo: async (grupoId) => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             f.nombres as feligres_nombres, 
             f.apellidos as feligres_apellidos,
             f.correo as feligres_correo,
             f.cedula as feligres_cedula,
             f.fecha_nacimiento as feligres_fecha_nacimiento,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN feligres f ON i.feligres_id = f.id
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.grupo_id = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [grupoId]);
    return rows.map(row => ({
      ...row,
      datos_adicionales: parseJSON(row.datos_adicionales)
    }));
  },

  getByTipo: async (tipo) => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             f.nombres as feligres_nombres, 
             f.apellidos as feligres_apellidos,
             f.correo as feligres_correo,
             f.cedula as feligres_cedula,
             f.fecha_nacimiento as feligres_fecha_nacimiento,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN feligres f ON i.feligres_id = f.id
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.tipo_servicio = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [tipo]);
    return rows.map(row => ({
      ...row,
      datos_adicionales: parseJSON(row.datos_adicionales)
    }));
  },

  getByEstado: async (estado) => {
    const [rows] = await pool.query(`
      SELECT i.id_inscripcion, i.feligres_id, i.tipo_servicio, i.grupo_id, 
             i.datos_adicionales, i.estado, i.fecha_inscripcion, i.fecha_actualizacion,
             f.nombres as feligres_nombres, 
             f.apellidos as feligres_apellidos,
             f.correo as feligres_correo,
             f.cedula as feligres_cedula,
             f.fecha_nacimiento as feligres_fecha_nacimiento,
             g.nombre_grupo
      FROM inscripciones i
      LEFT JOIN feligres f ON i.feligres_id = f.id
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.estado = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [estado]);
    return rows.map(row => ({
      ...row,
      datos_adicionales: parseJSON(row.datos_adicionales)
    }));
  },

  create: async (inscripcion) => {
    const datosAdicionales = typeof inscripcion.datos_adicionales === 'object' 
      ? JSON.stringify(inscripcion.datos_adicionales) 
      : inscripcion.datos_adicionales;

    const [result] = await pool.query(
      `INSERT INTO inscripciones 
        (feligres_id, tipo_servicio, grupo_id, datos_adicionales, estado) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        inscripcion.feligres_id,
        inscripcion.tipo_servicio,
        inscripcion.grupo_id || null,
        datosAdicionales || null,
        inscripcion.estado || 'pendiente'
      ]
    );
    return inscripcionQueries.getById(result.insertId);
  },

  update: async (id, inscripcion) => {
    const fields = [];
    const values = [];
    
    const fieldMappings = {
      feligres_id: 'feligres_id',
      tipo_servicio: 'tipo_servicio',
      grupo_id: 'grupo_id',
      datos_adicionales: 'datos_adicionales',
      estado: 'estado'
    };

    Object.entries(fieldMappings).forEach(([jsField, dbField]) => {
      if (inscripcion[jsField] !== undefined) {
        let value = inscripcion[jsField];
        if (jsField === 'datos_adicionales' && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE inscripciones SET ${fields.join(', ')} WHERE id_inscripcion = ?`,
      values
    );

    return inscripcionQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM inscripciones WHERE id_inscripcion = ?', [id]);
  },

  updateEstado: async (id, estado) => {
    await pool.query(
      'UPDATE inscripciones SET estado = ? WHERE id_inscripcion = ?',
      [estado, id]
    );
    return inscripcionQueries.getById(id);
  },

  getEstadisticas: async () => {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM inscripciones
    `);
    return stats[0];
  },

  getEstadisticasPorGrupo: async () => {
    const [rows] = await pool.query(`
      SELECT 
        g.id_grupo,
        g.nombre_grupo,
        COUNT(*) as total_inscripciones,
        SUM(CASE WHEN i.estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas
      FROM inscripciones i
      LEFT JOIN grupos_parroquiales g ON i.grupo_id = g.id_grupo
      WHERE i.grupo_id IS NOT NULL
      GROUP BY i.grupo_id, g.id_grupo, g.nombre_grupo
    `);
    return rows;
  }
};