// server/src/models/intencion.model.js
import { pool } from '../config/database.js';

export const intencionQueries = {
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      ORDER BY fecha_misa DESC, horario_misa ASC`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      WHERE id = ?`, 
      [id]
    );
    return rows[0] || null;
  },

  getByFecha: async (fecha) => {
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      WHERE fecha_misa = ? 
      ORDER BY horario_misa ASC`, 
      [fecha]
    );
    return rows;
  },

  getByEstado: async (estado) => {
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      WHERE estado = ? 
      ORDER BY fecha_misa DESC`, 
      [estado]
    );
    return rows;
  },

  create: async (intencion) => {
    const [result] = await pool.query(
      `INSERT INTO intenciones 
        (fecha_emision, estado, fecha_misa, motivo_misa, persona_ofrece, horario_misa, detalle_misa, valor) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        intencion.fechaEmision || new Date().toISOString().split('T')[0],
        intencion.estado || 'NO_EMITIDO',
        intencion.fechaMisa,
        intencion.motivoMisa || null,
        intencion.personaOfrece || null,
        intencion.horarioMisa || null,
        intencion.detalleMisa || null,
        intencion.valor || 0
      ]
    );
    return intencionQueries.getById(result.insertId);
  },

  update: async (id, intencion) => {
    const fields = [];
    const values = [];
    
    const mappings = {
      fechaEmision: 'fecha_emision',
      estado: 'estado',
      fechaMisa: 'fecha_misa',
      motivoMisa: 'motivo_misa',
      personaOfrece: 'persona_ofrece',
      horarioMisa: 'horario_misa',
      detalleMisa: 'detalle_misa',
      valor: 'valor'
    };

    Object.entries(mappings).forEach(([jsField, dbField]) => {
      if (intencion[jsField] !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(intencion[jsField]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE intenciones SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return intencionQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM intenciones WHERE id = ?', [id]);
  },

  search: async (query) => {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      WHERE persona_ofrece LIKE ? 
         OR detalle_misa LIKE ? 
         OR motivo_misa LIKE ?
      ORDER BY fecha_misa DESC`,
      [searchTerm, searchTerm, searchTerm]
    );
    return rows;
  },

  getEstadisticas: async () => {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'EMITIDO' THEN 1 ELSE 0 END) as emitidas,
        SUM(CASE WHEN estado = 'NO_EMITIDO' THEN 1 ELSE 0 END) as noEmitidas,
        SUM(valor) as valorTotal,
        SUM(CASE WHEN estado = 'EMITIDO' THEN valor ELSE 0 END) as valorRecaudado
      FROM intenciones
    `);
    return stats[0];
  },

  getEstadisticasPorMes: async () => {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_misa, '%Y-%m') as mes,
        COUNT(*) as total,
        SUM(valor) as valorTotal
      FROM intenciones
      WHERE fecha_misa >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_misa, '%Y-%m')
      ORDER BY mes DESC
    `);
    return rows;
  },

  getProximasIntenciones: async (dias = 7) => {
    const [rows] = await pool.query(
      `SELECT 
        id as intencionId,
        fecha_emision as fechaEmision,
        estado,
        fecha_misa as fechaMisa,
        motivo_misa as motivoMisa,
        persona_ofrece as personaOfrece,
        horario_misa as horarioMisa,
        detalle_misa as detalleMisa,
        valor
      FROM intenciones 
      WHERE fecha_misa BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND estado IN ('NO_EMITIDO', 'EMITIDO')
      ORDER BY fecha_misa ASC, horario_misa ASC`,
      [dias]
    );
    return rows;
  }
};