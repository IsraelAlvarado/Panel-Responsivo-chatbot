// server/src/controllers/faq.controller.js
import { faqQueries } from '../models/faq.model.js';

export const faqController = {
  getAll: async (req, res) => {
    try {
      const faqs = await faqQueries.getAll();
      res.json({ rows: faqs, count: faqs.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo FAQs', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const faq = await faqQueries.getById(parseInt(req.params.id));
      if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });
      res.json(faq);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo FAQ', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const faq = await faqQueries.create(req.body);
      res.status(201).json(faq);
    } catch (error) {
      res.status(500).json({ error: 'Error creando FAQ', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const faq = await faqQueries.update(parseInt(req.params.id), req.body);
      res.json(faq);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando FAQ', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await faqQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando FAQ', details: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { query } = req.body;
      const faqs = await faqQueries.search(query || '');
      res.json({ rows: faqs, count: faqs.length });
    } catch (error) {
      res.status(500).json({ error: 'Error buscando FAQs', details: error.message });
    }
  },

  filterByCategory: async (req, res) => {
    try {
      const faqs = await faqQueries.filterByCategory(req.params.category);
      res.json({ rows: faqs, count: faqs.length });
    } catch (error) {
      res.status(500).json({ error: 'Error filtrando FAQs', details: error.message });
    }
  }
};