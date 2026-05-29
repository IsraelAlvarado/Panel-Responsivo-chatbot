// server/src/controllers/botpress.controller.js

import axios from 'axios';
import { config } from '../config/env.js';

const BOTPRESS_URL = config.BOTPRESS_URL;
const BOTPRESS_BOT_ID = config.BOTPRESS_BOT_ID;
const BOTPRESS_TOKEN = config.BOTPRESS_TOKEN;
const BOTPRESS_WORKSPACE_ID = config.BOTPRESS_WORKSPACE_ID;

function getBotpressHeaders() {
  const headers = {
    'Authorization': `Bearer ${BOTPRESS_TOKEN}`,
    'Content-Type': 'application/json',
    'x-bot-id': BOTPRESS_BOT_ID
  };

  if (BOTPRESS_WORKSPACE_ID) {
    headers['x-workspace-id'] = BOTPRESS_WORKSPACE_ID;
  }

  return headers;
}

export const botpressController = {
  getConversations: async (req, res) => {
    try {
      const response = await axios.get(`${BOTPRESS_URL}/v1/chat/conversations`, {
        headers: getBotpressHeaders(),
        params: { botId: BOTPRESS_BOT_ID }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Error obteniendo conversaciones', 
        details: error.response?.data || error.message 
      });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de conversacion requerido' });
      }

      const response = await axios.get(`${BOTPRESS_URL}/v1/chat/messages`, {
        headers: getBotpressHeaders(),
        params: { conversationId }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error obteniendo mensajes:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Error obteniendo mensajes', 
        details: error.response?.data || error.message 
      });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { text } = req.body;

      if (!conversationId || !text) {
        return res.status(400).json({ error: 'ID de conversacion y texto requeridos' });
      }

      const response = await axios.post(
        `${BOTPRESS_URL}/v1/chat/messages`,
        {
          conversationId,
          payload: {
            type: 'text',
            text
          }
        },
        { headers: getBotpressHeaders() }
      );

      res.json(response.data);
    } catch (error) {
      console.error('Error enviando mensaje:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Error enviando mensaje', 
        details: error.response?.data || error.message 
      });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de conversacion requerido' });
      }


      const response = await axios.delete(
        `${BOTPRESS_URL}/v1/chat/conversations/${conversationId}`,
        { headers: getBotpressHeaders() }
      );
      
      res.status(response.status).json(response.data || { success: true });
    } catch (error) {
      console.error('[Botpress] Error eliminando:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      res.status(error.response?.status || 500).json({ 
        error: 'Error eliminando conversacion', 
        details: error.response?.data || error.message 
      });
    }
  }
};