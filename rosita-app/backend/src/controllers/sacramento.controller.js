// server/src/controllers/sacramento.controller.js
import { sacramentoQueries } from '../models/sacramento.model.js';

export const sacramentoController = {
  getAll: async (req, res) => {
    try {
      const sacramentos = await sacramentoQueries.getAll();
      res.json(sacramentos);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo sacramentos', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const sacramento = await sacramentoQueries.getById(parseInt(req.params.id));
      if (!sacramento) return res.status(404).json({ error: 'Sacramento no encontrado' });
      res.json(sacramento);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo sacramento', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const sacramento = await sacramentoQueries.create(req.body);
      res.status(201).json(sacramento);
    } catch (error) {
      res.status(500).json({ error: 'Error creando sacramento', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const sacramento = await sacramentoQueries.update(parseInt(req.params.id), req.body);
      res.json(sacramento);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando sacramento', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await sacramentoQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando sacramento', details: error.message });
    }
  }
};