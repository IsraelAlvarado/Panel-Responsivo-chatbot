// server/src/models/faq.model.js
import { pool } from '../config/database.js';

export const faqQueries = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM faqs ORDER BY orden, id_faq DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM faqs WHERE id_faq = ?', [id]);
    return rows[0] || null;
  },

  create: async (faq) => {
    const [result] = await pool.query(
      `INSERT INTO faqs (pregunta, respuesta, categoria, orden, activo) VALUES (?, ?, ?, ?, ?)`,
      [
        faq.pregunta, 
        faq.respuesta, 
        faq.categoria, 
        faq.orden || 0, 
        faq.activo !== undefined ? faq.activo : true
      ]
    );
    return faqQueries.getById(result.insertId);
  },

  update: async (id, faq) => {
    const updates = [];
    const values = [];
    
    if (faq.pregunta !== undefined) {
      updates.push('pregunta = ?');
      values.push(faq.pregunta);
    }
    if (faq.respuesta !== undefined) {
      updates.push('respuesta = ?');
      values.push(faq.respuesta);
    }
    if (faq.categoria !== undefined) {
      updates.push('categoria = ?');
      values.push(faq.categoria);
    }
    if (faq.orden !== undefined) {
      updates.push('orden = ?');
      values.push(faq.orden);
    }
    if (faq.activo !== undefined) {
      updates.push('activo = ?');
      values.push(faq.activo);
    }
    
    if (updates.length === 0) return null;
    
    values.push(id);
    await pool.query(
      `UPDATE faqs SET ${updates.join(', ')} WHERE id_faq = ?`,
      values
    );
    return faqQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM faqs WHERE id_faq = ?', [id]);
    return { success: true, id };
  },

  search: async (query) => {
    const [rows] = await pool.query(
      `SELECT * FROM faqs WHERE pregunta LIKE ? OR respuesta LIKE ? OR categoria LIKE ? ORDER BY orden, id_faq DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  },

  filterByCategory: async (categoria) => {
    const [rows] = await pool.query(
      'SELECT * FROM faqs WHERE categoria = ? ORDER BY orden, id_faq DESC', 
      [categoria]
    );
    return rows;
  }
};