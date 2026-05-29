// server/src/models/sacramento.model.js
import { pool } from '../config/database.js';

const selectWithJoin = `
  SELECT h.*,
         f1.nombres as persona1_nombres,
         f1.apellidos as persona1_apellidos,
         f2.nombres as persona2_nombres,
         f2.apellidos as persona2_apellidos,
         m.nombres as ministro_nombres,
         m.apellidos as ministro_apellidos
  FROM historial_sacramental h
  LEFT JOIN feligres f1 ON h.persona_sacramento1 = f1.id
  LEFT JOIN feligres f2 ON h.persona_sacramento2 = f2.id
  LEFT JOIN ministro m ON h.ministro_sacramento = m.id
`;

export const sacramentoQueries = {
  getAll: async () => {
    const [rows] = await pool.query(
      `${selectWithJoin} ORDER BY h.fecha_sacramento DESC`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `${selectWithJoin} WHERE h.id = ?`, 
      [id]
    );
    return rows[0];
  },

  create: async (sacramento) => {
    const [result] = await pool.query(
      `INSERT INTO historial_sacramental (
        tipo_sacramento, fecha_sacramento, lugar_sacramento, ministro_sacramento,
        ciudad_sacramento, provincia_sacramento, persona_sacramento1, padre1, madre1,
        padrino1, padrino2, madrina1, madrina2, testigo1, testigo2,
        persona_sacramento2, padre2, madre2, anio, tomo, pagina, acta, numero, lugar_reg_civil
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sacramento.tipo_sacramento, 
        sacramento.fecha_sacramento, 
        sacramento.lugar_sacramento || null, 
        sacramento.ministro_sacramento || null,
        sacramento.ciudad_sacramento || null,
        sacramento.provincia_sacramento || null,
        sacramento.persona_sacramento1,
        sacramento.padre1 || null,
        sacramento.madre1 || null,
        sacramento.padrino1 || null,
        sacramento.padrino2 || null,
        sacramento.madrina1 || null,
        sacramento.madrina2 || null,
        sacramento.testigo1 || null,
        sacramento.testigo2 || null,
        sacramento.persona_sacramento2 || null,
        sacramento.padre2 || null,
        sacramento.madre2 || null,
        sacramento.anio || null,
        sacramento.tomo || null,
        sacramento.pagina || null,
        sacramento.acta || null,
        sacramento.numero || null,
        sacramento.lugar_reg_civil || null
      ]
    );
    return sacramentoQueries.getById(result.insertId);
  },

  update: async (id, sacramento) => {
    const fields = [];
    const values = [];
    
    const fieldMappings = {
      tipo_sacramento: 'tipo_sacramento',
      fecha_sacramento: 'fecha_sacramento',
      lugar_sacramento: 'lugar_sacramento',
      ministro_sacramento: 'ministro_sacramento',
      ciudad_sacramento: 'ciudad_sacramento',
      provincia_sacramento: 'provincia_sacramento',
      persona_sacramento1: 'persona_sacramento1',
      padre1: 'padre1',
      madre1: 'madre1',
      padrino1: 'padrino1',
      padrino2: 'padrino2',
      madrina1: 'madrina1',
      madrina2: 'madrina2',
      testigo1: 'testigo1',
      testigo2: 'testigo2',
      persona_sacramento2: 'persona_sacramento2',
      padre2: 'padre2',
      madre2: 'madre2',
      anio: 'anio',
      tomo: 'tomo',
      pagina: 'pagina',
      acta: 'acta',
      numero: 'numero',
      lugar_reg_civil: 'lugar_reg_civil'
    };

    Object.entries(fieldMappings).forEach(([jsField, dbField]) => {
      if (sacramento[jsField] !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(sacramento[jsField]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE historial_sacramental SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return sacramentoQueries.getById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM historial_sacramental WHERE id = ?', [id]);
  }
};