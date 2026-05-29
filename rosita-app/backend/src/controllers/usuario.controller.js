// server/src/controllers/usuario.controller.js
import { usuarioQueries } from '../models/usuario.model.js';

export const usuarioController = {
  getAll: async (req, res) => {
    try {
      const usuarios = await usuarioQueries.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo usuarios', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const usuario = await usuarioQueries.getById(parseInt(req.params.id));
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo usuario', details: error.message });
    }
  },

  getByCorreo: async (req, res) => {
    try {
      const usuario = await usuarioQueries.getByCorreo(req.params.correo);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo usuario', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const usuario = await usuarioQueries.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error creando usuario', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const usuario = await usuarioQueries.update(parseInt(req.params.id), req.body);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando usuario', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await usuarioQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando usuario', details: error.message });
    }
  }
};