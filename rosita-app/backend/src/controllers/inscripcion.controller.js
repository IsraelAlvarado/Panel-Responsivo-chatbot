// server/src/controllers/inscripcion.controller.js
import { inscripcionQueries } from '../models/inscripcion.model.js';
import { feligresQueries } from '../models/feligres.model.js';

export const inscripcionController = {
  getAll: async (req, res) => {
    try {
      const inscripciones = await inscripcionQueries.getAll();
      res.json({ rows: inscripciones, count: inscripciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo inscripciones', details: error.message });
    }
  },

  getByTipo: async (req, res) => {
    try {
      const inscripciones = await inscripcionQueries.getByTipo(req.params.tipo);
      res.json({ rows: inscripciones, count: inscripciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo inscripciones', details: error.message });
    }
  },

  getByGrupo: async (req, res) => {
    try {
      const inscripciones = await inscripcionQueries.getByGrupo(parseInt(req.params.grupoId));
      res.json({ rows: inscripciones, count: inscripciones.length });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo inscripciones', details: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const inscripcion = await inscripcionQueries.getById(parseInt(req.params.id));
      if (!inscripcion) return res.status(404).json({ error: 'Inscripcion no encontrada' });
      res.json(inscripcion);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo inscripcion', details: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { 
        feligres_nombres, 
        feligres_apellidos, 
        feligres_correo,
        feligres_cedula,
        feligres_fecha_nacimiento,
        feligres_ciudad_nacimiento,
        feligres_localidad_nacimiento,
        feligres_domicilio,
        feligres_sexo,
        feligres_nacionalidad,
        tipo_servicio,
        grupo_id,
        datos_adicionales,
        estado,
        feligres_id
      } = req.body;

      if (!feligres_nombres || !feligres_apellidos || !tipo_servicio) {
        return res.status(400).json({ 
          error: 'Datos incompletos', 
          details: 'Nombres, apellidos del feligres y tipo de servicio son requeridos' 
        });
      }

      let feligresId = feligres_id;

      if (!feligresId) {
        const feligresExistente = await feligresQueries.findByNombreApellidos(
          feligres_nombres, 
          feligres_apellidos
        );

        if (feligresExistente) {
          feligresId = feligresExistente.id;
          
          const updates = {};
          if (feligres_correo && !feligresExistente.correo) updates.correo = feligres_correo;
          if (feligres_cedula && !feligresExistente.cedula) updates.cedula = feligres_cedula;
          if (feligres_fecha_nacimiento && !feligresExistente.fecha_nacimiento) updates.fecha_nacimiento = feligres_fecha_nacimiento;
          
          if (Object.keys(updates).length > 0) {
            await feligresQueries.update(feligresId, updates);
          }
        } else {
          const nuevoFeligres = await feligresQueries.create({
            cedula: feligres_cedula || '',
            nombres: feligres_nombres,
            apellidos: feligres_apellidos,
            correo: feligres_correo || null,
            fecha_nacimiento: feligres_fecha_nacimiento || null,
            ciudad_nacimiento: feligres_ciudad_nacimiento || null,
            localidad_nacimiento: feligres_localidad_nacimiento || null,
            domicilio: feligres_domicilio || null,
            sexo: feligres_sexo || null,
            nacionalidad: feligres_nacionalidad || null
          });
          feligresId = nuevoFeligres.id;
        }
      }

      const inscripcion = await inscripcionQueries.create({
        feligres_id: feligresId,
        tipo_servicio,
        grupo_id: grupo_id || null,
        datos_adicionales: datos_adicionales || {},
        estado: estado || 'pendiente'
      });

      res.status(201).json(inscripcion);
    } catch (error) {
      res.status(500).json({ error: 'Error creando inscripcion', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const inscripcion = await inscripcionQueries.update(parseInt(req.params.id), req.body);
      if (!inscripcion) return res.status(404).json({ error: 'Inscripcion no encontrada' });
      res.json(inscripcion);
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando inscripcion', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await inscripcionQueries.delete(parseInt(req.params.id));
      res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando inscripcion', details: error.message });
    }
  },

  getEstadisticas: async (req, res) => {
    try {
      const stats = await inscripcionQueries.getEstadisticas();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo estadisticas', details: error.message });
    }
  }
};