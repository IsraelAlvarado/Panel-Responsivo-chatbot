// server/src/controllers/grupo.controller.js
import { grupoQueries } from '../models/grupo.model.js';

export const grupoController = {
  getAll: async (req, res) => {
    try {
      const grupos = await grupoQueries.getAll();
      res.json({ rows: grupos, count: grupos.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo grupos', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const grupo = await grupoQueries.getById(parseInt(req.params.id));
      if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
      res.json(grupo);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo grupo', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const grupo = await grupoQueries.create(req.body);
      res.status(201).json(grupo);
    } catch (error) {
      res.status(500).json({ error: 'Error creando grupo', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const grupo = await grupoQueries.update(parseInt(req.params.id), req.body);
      res.json(grupo);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando grupo', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await grupoQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando grupo', details: error.message });
    }
  }
};