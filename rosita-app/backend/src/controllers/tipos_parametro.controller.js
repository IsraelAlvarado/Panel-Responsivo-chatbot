// server/src/controllers/tipos_parametro.controller.js
import { tiposParametroQueries } from '../models/tipos_parametro.model.js';

export const tiposParametroController = {
  getAll: async (req, res) => {
    try {
      const parametros = await tiposParametroQueries.getAll();
      res.json({ rows: parametros, count: parametros.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo parametros', details: error.message });
    }
  },

  getByTipo: async (req, res) => {
    try {
      const parametros = await tiposParametroQueries.getByTipo(req.params.tipo);
      res.json({ rows: parametros, count: parametros.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo parametros por tipo', details: error.message });
    }
  },

  getHorariosMisa: async (req, res) => {
    try {
      const horarios = await tiposParametroQueries.getHorariosMisa();
      res.json({ rows: horarios, count: horarios.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo horarios de misa', details: error.message });
    }
  },

  getMotivosMisa: async (req, res) => {
    try {
      const motivos = await tiposParametroQueries.getMotivosMisa();
      res.json({ rows: motivos, count: motivos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo motivos de misa', details: error.message });
    }
  },

  getParroquias: async (req, res) => {
    try {
      const parroquias = await tiposParametroQueries.getParroquias();
      res.json({ rows: parroquias, count: parroquias.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo parroquias', details: error.message });
    }
  },

  getTiposEvento: async (req, res) => {
    try {
      const tipos = await tiposParametroQueries.getTiposEvento();
      res.json({ rows: tipos, count: tipos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo tipos de evento', details: error.message });
    }
  },

  getEstadosEvento: async (req, res) => {
    try {
      const estados = await tiposParametroQueries.getEstadosEvento();
      res.json({ rows: estados, count: estados.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo estados de evento', details: error.message });
    }
  }
};