// server/src/controllers/onesignal.controller.js
import { config } from '../config/env.js';

const ONESIGNAL_API_KEY = config.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_APP_ID = config.ONESIGNAL_APP_ID;
const ONESIGNAL_EXTERNAL_ID = config.ONESIGNAL_EXTERNAL_ID;

export const OneSignalController = {
  async getTemplates(req, res, next) {
    try {
      const { limit = 50, offset = 0, channel } = req.query;
      
      let url = `https://api.onesignal.com/templates?app_id=${ONESIGNAL_APP_ID}&limit=${limit}&offset=${offset}`;
      if (channel) url += `&channel=${channel}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'OneSignal REST API v1 no soporta listado de templates.',
          error: data
        });
      }

      res.json({
        success: true,
        data: data.templates || []
      });

    } catch (error) {
      next(error);
    }
  },

  async getTemplateById(req, res, next) {
    try {
      const { templateId } = req.params;
      
      const response = await fetch(
        `https://api.onesignal.com/templates/${templateId}?app_id=${ONESIGNAL_APP_ID}`,
        {
          headers: {
            'Authorization': `Key ${ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: 'Error obteniendo template',
          details: data
        });
      }

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req, res, next) {
    try {
      const { name, titulo, mensaje } = req.body;

      const response = await fetch('https://api.onesignal.com/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          name: name,
          contents: { en: mensaje },
          headings: { en: titulo }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: 'Error creando template en OneSignal',
          details: data
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: data.id,
          name: name,
          titulo: titulo,
          mensaje: mensaje,
          onesignal_response: data
        },
        message: 'Template creado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const { name, titulo, mensaje } = req.body;

      const response = await fetch(
        `https://api.onesignal.com/templates/${templateId}?app_id=${ONESIGNAL_APP_ID}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Key ${ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            name: name,
            contents: { en: mensaje },
            headings: { en: titulo }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: 'Error actualizando template',
          details: data
        });
      }

      res.json({
        success: true,
        data: {
          id: templateId,
          name: name,
          titulo: titulo,
          mensaje: mensaje,
          onesignal_response: data
        },
        message: 'Template actualizado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  },

  async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      const response = await fetch(
        `https://api.onesignal.com/templates/${templateId}?app_id=${ONESIGNAL_APP_ID}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Key ${ONESIGNAL_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        return res.status(400).json({
          success: false,
          error: 'Error eliminando template',
          details: data
        });
      }

      res.json({
        success: true,
        message: 'Template eliminado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  },

  async sendToAll(req, res, next) {
    try {
      const { templateId } = req.body;

      if (!templateId) {
        return res.status(400).json({
          success: false,
          error: 'templateId es requerido'
        });
      }

      console.log('[OneSignal] Enviando notificacion con template_id:', templateId);

      const response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          template_id: templateId,
          included_segments: ['Subscribed Users'],
          target_channel: 'push'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[OneSignal] Error:', data);
        return res.status(400).json({
          success: false,
          error: 'Error enviando notificacion',
          details: data
        });
      }

      res.json({
        success: true,
        data: data,
        message: 'Notificacion enviada exitosamente a todos los suscritos'
      });

    } catch (error) {
      next(error);
    }
  },

  async sendToExternalId(req, res, next) {
    try {
      const { templateId } = req.body;

      if (!templateId) {
        return res.status(400).json({
          success: false,
          error: 'templateId es requerido'
        });
      }

      const response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          template_id: templateId,
          include_aliases: {
            external_id: [ONESIGNAL_EXTERNAL_ID]
          },
          target_channel: 'push'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: 'Error enviando notificacion',
          details: data
        });
      }

      res.json({
        success: true,
        data: data,
        message: 'Notificacion enviada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }
};