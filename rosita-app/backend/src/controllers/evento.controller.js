// server/src/controllers/evento.controller.js
import { eventoQueries } from '../models/evento.model.js';

export const eventoController = {
  getAll: async (req, res) => {
    try {
      const eventos = await eventoQueries.getAll();
      res.json({ rows: eventos, count: eventos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo eventos', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const evento = await eventoQueries.getById(parseInt(req.params.id));
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo evento', details: error.message });
    }
  },

  getByTipo: async (req, res) => {
    try {
      const eventos = await eventoQueries.getByTipo(req.params.tipo);
      res.json({ rows: eventos, count: eventos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo eventos por tipo', details: error.message });
    }
  },

  getByFecha: async (req, res) => {
    try {
      const eventos = await eventoQueries.getByFecha(req.params.fecha);
      res.json({ rows: eventos, count: eventos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo eventos por fecha', details: error.message });
    }
  },

  getByEstado: async (req, res) => {
    try {
      const eventos = await eventoQueries.getByEstado(req.params.estado);
      res.json({ rows: eventos, count: eventos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo eventos por estado', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const evento = await eventoQueries.create(req.body);
      res.status(201).json(evento);
    } catch (error) {
      res.status(500).json({ error: 'Error creando evento', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const evento = await eventoQueries.update(parseInt(req.params.id), req.body);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando evento', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await eventoQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando evento', details: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { query } = req.body;
      const results = await eventoQueries.search(query || '');
      res.json({ rows: results, count: results.length });
    } catch (error) {
      res.status(500).json({ error: 'Error buscando eventos', details: error.message });
    }
  },

  getEstadisticas: async (req, res) => {
    try {
      const stats = await eventoQueries.getEstadisticas();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo estadísticas', details: error.message });
    }
  },

  getProximos: async (req, res) => {
    try {
      const dias = parseInt(req.params.dias) || 30;
      const eventos = await eventoQueries.getProximosEventos(dias);
      res.json({ rows: eventos, count: eventos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo próximos eventos', details: error.message });
    }
  }
};