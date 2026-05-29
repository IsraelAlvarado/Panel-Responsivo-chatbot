// server/src/models/evento.model.js
import { pool } from '../config/database.js';

export const eventoQueries = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      ORDER BY fecha DESC, id DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE id = ?`, 
      [id]
    );
    return rows[0] || null;
  },

  getByTipo: async (tipo) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE tipoevento = ? 
      ORDER BY fecha DESC`, 
      [tipo]
    );
    return rows;
  },

  getByFecha: async (fecha) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE fecha = ? 
      ORDER BY nombre ASC`, 
      [fecha]
    );
    return rows;
  },

  getByEstado: async (estado) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE estado = ? 
      ORDER BY fecha DESC`, 
      [estado]
    );
    return rows;
  },

  create: async (evento) => {
    const [result] = await pool.query(
      `INSERT INTO evento 
        (tipoevento, nombre, fecha, lugar, descripcion, estado, observacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        evento.tipoevento,
        evento.nombre,
        evento.fecha,
        evento.lugar || null,
        evento.descripcion || null,
        evento.estado || 'AC',
        evento.observacion || null
      ]
    );
    return eventoQueries.getById(result.insertId);
  },

  update: async (id, evento) => {
    const fields = [];
    const values = [];
    
    const mappings = {
      tipoevento: 'tipoevento',
      nombre: 'nombre',
      fecha: 'fecha',
      lugar: 'lugar',
      descripcion: 'descripcion',
      estado: 'estado',
      observacion: 'observacion'
    };

    Object.entries(mappings).forEach(([jsField, dbField]) => {
      if (evento[jsField] !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(evento[jsField]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE evento SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return eventoQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM evento WHERE id = ?', [id]);
    return { success: true, id };
  },

  search: async (query) => {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE nombre LIKE ? 
         OR descripcion LIKE ? 
         OR lugar LIKE ?
      ORDER BY fecha DESC`,
      [searchTerm, searchTerm, searchTerm]
    );
    return rows;
  },

  getEstadisticas: async () => {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'AC' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 'IN' THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN estado = 'CA' THEN 1 ELSE 0 END) as cancelados,
        SUM(CASE WHEN fecha >= CURDATE() THEN 1 ELSE 0 END) as proximos,
        SUM(CASE WHEN fecha < CURDATE() THEN 1 ELSE 0 END) as pasados
      FROM evento
    `);
    return stats[0];
  },

  getProximosEventos: async (dias = 30) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipoevento,
        nombre,
        fecha,
        lugar,
        descripcion,
        estado,
        observacion
      FROM evento 
      WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND estado = 'AC'
      ORDER BY fecha ASC`,
      [dias]
    );
    return rows;
  }
};