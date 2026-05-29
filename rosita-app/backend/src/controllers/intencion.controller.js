// server/src/controllers/intencion.controller.js
import { intencionQueries } from '../models/intencion.model.js';

export const intencionController = {
  getAll: async (req, res) => {
    try {
      const intenciones = await intencionQueries.getAll();
      res.json({ rows: intenciones, count: intenciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo intenciones', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const intencion = await intencionQueries.getById(parseInt(req.params.id));
      if (!intencion) return res.status(404).json({ error: 'Intencion no encontrada' });
      res.json(intencion);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo intencion', details: error.message });
    }
  },

  getByFecha: async (req, res) => {
    try {
      const intenciones = await intencionQueries.getByFecha(req.params.fecha);
      res.json({ rows: intenciones, count: intenciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo intenciones por fecha', details: error.message });
    }
  },

  getByEstado: async (req, res) => {
    try {
      const intenciones = await intencionQueries.getByEstado(req.params.estado);
      res.json({ rows: intenciones, count: intenciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo intenciones por estado', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const intencion = await intencionQueries.create(req.body);
      res.status(201).json(intencion);
    } catch (error) {
      res.status(500).json({ error: 'Error creando intencion', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const intencion = await intencionQueries.update(parseInt(req.params.id), req.body);
      if (!intencion) return res.status(404).json({ error: 'Intencion no encontrada' });
      res.json(intencion);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando intencion', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await intencionQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando intencion', details: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { query } = req.body;
      const results = await intencionQueries.search(query || '');
      res.json({ rows: results, count: results.length });
    } catch (error) {
      res.status(500).json({ error: 'Error buscando intenciones', details: error.message });
    }
  },

  getEstadisticas: async (req, res) => {
    try {
      const stats = await intencionQueries.getEstadisticas();
      const response = {
        total: stats.total || 0,
        emitidas: stats.emitidas || 0,
        noEmitidas: stats.noEmitidas || 0,
        valorTotal: stats.valorTotal || 0,
        valorRecaudado: stats.valorRecaudado || 0
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo estadisticas', details: error.message });
    }
  },

  getEstadisticasPorMes: async (req, res) => {
    try {
      const stats = await intencionQueries.getEstadisticasPorMes();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo estadisticas mensuales', details: error.message });
    }
  },

  getProximas: async (req, res) => {
    try {
      const dias = parseInt(req.params.dias) || 7;
      const intenciones = await intencionQueries.getProximasIntenciones(dias);
      res.json({ rows: intenciones, count: intenciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo proximas intenciones', details: error.message });
    }
  }
};