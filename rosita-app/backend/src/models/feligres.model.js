// server/src/models/feligres.model.js
import { pool } from '../config/database.js';

export const feligresQueries = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      ORDER BY apellidos, nombres
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  },

  getByCedula: async (cedula) => {
    const [rows] = await pool.query(`
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      WHERE cedula = ?
    `, [cedula]);
    return rows[0] || null;
  },

  findByNombreApellidos: async (nombres, apellidos) => {
    const [rows] = await pool.query(`
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      WHERE nombres = ? AND apellidos = ?
    `, [nombres, apellidos]);
    return rows[0] || null;
  },

  findByNombreApellidosCorreo: async (nombres, apellidos, correo) => {
    let query = `
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      WHERE nombres = ? AND apellidos = ?
    `;
    let params = [nombres, apellidos];

    if (correo) {
      query += ' AND correo = ?';
      params.push(correo);
    }

    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  create: async (feligres) => {
    const [result] = await pool.query(
      `INSERT INTO feligres (cedula, nombres, apellidos, fecha_nacimiento, 
        ciudad_nacimiento, localidad_nacimiento, domicilio, correo, sexo, nacionalidad) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feligres.cedula || '',
        feligres.nombres,
        feligres.apellidos,
        feligres.fecha_nacimiento || null,
        feligres.ciudad_nacimiento || null,
        feligres.localidad_nacimiento || null,
        feligres.domicilio || null,
        feligres.correo || null,
        feligres.sexo || null,
        feligres.nacionalidad || null
      ]
    );
    return feligresQueries.getById(result.insertId);
  },

  update: async (id, feligres) => {
    const updates = [];
    const values = [];
    
    const fields = ['cedula', 'nombres', 'apellidos', 'fecha_nacimiento', 
                   'ciudad_nacimiento', 'localidad_nacimiento', 'domicilio', 
                   'correo', 'sexo', 'nacionalidad'];
    
    fields.forEach(field => {
      if (feligres[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(feligres[field]);
      }
    });
    
    if (updates.length === 0) return null;
    
    values.push(id);
    await pool.query(
      `UPDATE feligres SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return feligresQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM feligres WHERE id = ?', [id]);
    return { success: true, id };
  },

  search: async (query) => {
    const [rows] = await pool.query(`
      SELECT id, cedula, nombres, apellidos, fecha_nacimiento, 
             ciudad_nacimiento, localidad_nacimiento, domicilio, 
             correo, sexo, nacionalidad
      FROM feligres 
      WHERE nombres LIKE ? OR apellidos LIKE ? OR cedula LIKE ? OR correo LIKE ?
      ORDER BY apellidos, nombres
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
    return rows;
  }
};