// server/src/controllers/feligres.controller.js
import { feligresQueries } from '../models/feligres.model.js';

export const feligresController = {
  getAll: async (req, res) => {
    try {
      const feligreses = await feligresQueries.getAll();
      res.json(feligreses);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo feligreses', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const feligres = await feligresQueries.getById(parseInt(req.params.id));
      if (!feligres) return res.status(404).json({ error: 'Feligres no encontrado' });
      res.json(feligres);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo feligres', details: error.message });
    }
  },

  getByCedula: async (req, res) => {
    try {
      const feligres = await feligresQueries.getByCedula(req.params.cedula);
      if (!feligres) return res.status(404).json({ error: 'Feligres no encontrado' });
      res.json(feligres);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo feligres', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const feligres = await feligresQueries.create(req.body);
      res.status(201).json(feligres);
    } catch (error) {
      res.status(500).json({ error: 'Error creando feligres', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const feligres = await feligresQueries.update(parseInt(req.params.id), req.body);
      res.json(feligres);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando feligres', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await feligresQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando feligres', details: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const feligreses = await feligresQueries.search(req.query.q || '');
      res.json(feligreses);
    } catch (error) {
      res.status(500).json({ error: 'Error buscando feligreses', details: error.message });
    }
  }
};