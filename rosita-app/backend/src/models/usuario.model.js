// server/src/models/usuario.model.js
import { pool } from '../config/database.js';

export const usuarioQueries = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM usuario ORDER BY id DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
    return rows[0];
  },

  getByCorreo: async (correo) => {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE correo = ?', [correo]);
    return rows[0];
  },

  create: async (usuario) => {
    const [result] = await pool.query(
      `INSERT INTO usuario (nombre, contrasena, correo, rol) VALUES (?, ?, ?, ?)`,
      [usuario.nombre, usuario.contrasena, usuario.correo, usuario.rol || 'feligres']
    );
    return usuarioQueries.getById(result.insertId);
  },

  update: async (id, usuario) => {
    await pool.query(
      `UPDATE usuario SET nombre = ?, contrasena = ?, correo = ?, rol = ? WHERE id = ?`,
      [usuario.nombre, usuario.contrasena, usuario.correo, usuario.rol, id]
    );
    return usuarioQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
  }
};