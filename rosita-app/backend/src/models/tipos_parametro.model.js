// server/src/models/tipos_parametro.model.js
import { pool } from '../config/database.js';

export const tiposParametroQueries = {
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipos as tipo,
        codigo,
        descripcion,
        gcp,
        gsm,
        cupo
      FROM tipos_parametros 
      ORDER BY tipos, codigo`
    );
    return rows;
  },

  getByTipo: async (tipo) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipos as tipo,
        codigo,
        descripcion,
        gcp,
        gsm,
        cupo
      FROM tipos_parametros 
      WHERE tipos = ?
      ORDER BY codigo`,
      [tipo]
    );
    return rows;
  },

  getByCodigo: async (codigo) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipos as tipo,
        codigo,
        descripcion,
        gcp,
        gsm,
        cupo
      FROM tipos_parametros 
      WHERE codigo = ?`,
      [codigo]
    );
    return rows[0] || null;
  },

  getHorariosMisa: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        codigo,
        descripcion
      FROM tipos_parametros 
      WHERE tipos = 'Horarios de Misa'
      ORDER BY codigo`,
      []
    );
    return rows;
  },

  getMotivosMisa: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        codigo,
        descripcion
      FROM tipos_parametros 
      WHERE tipos = 'Motivos de Misa'
      ORDER BY codigo`,
      []
    );
    return rows;
  },

  getParroquias: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        codigo,
        descripcion
      FROM tipos_parametros 
      WHERE tipos = 'Parroquias'
      ORDER BY descripcion`,
      []
    );
    return rows;
  },

  getTiposEvento: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        codigo,
        descripcion
      FROM tipos_parametros 
      WHERE tipos = 'Evento'
      ORDER BY codigo`,
      []
    );
    return rows;
  },

  getEstadosEvento: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        codigo,
        descripcion
      FROM tipos_parametros 
      WHERE tipos = 'EstadoEvento'
      ORDER BY codigo`,
      []
    );
    return rows;
  }
};