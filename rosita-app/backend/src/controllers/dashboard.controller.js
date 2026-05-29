import { DashboardModel } from '../models/dashboard.model.js';
import { getPool } from '../config/database.js';
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

async function fetchAllConversations() {
  const allConversations = [];
  let nextToken = null;
  let hasMore = true;
  let attempts = 0;
  const maxAttempts = 50;

  while (hasMore && attempts < maxAttempts) {
    try {
      const params = { botId: BOTPRESS_BOT_ID };
      if (nextToken) {
        params.nextToken = nextToken;
      }

      const response = await axios.get(
        `${BOTPRESS_URL}/v1/chat/conversations`,
        { 
          headers: getBotpressHeaders(),
          params 
        }
      );

      const conversations = response.data.conversations || [];
      allConversations.push(...conversations);

      nextToken = response.data.meta?.nextToken;
      hasMore = !!nextToken;
      attempts++;

      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching conversations:', error.response?.data || error.message);
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
  }

  return allConversations;
}

function calculateWeeklyActivity(conversations) {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    weekDates.push(date);
  }

  const activityData = weekDates.map((date) => ({
    day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
    total: 0,
    completed: 0,
    pending: 0,
    active: 0
  }));

  conversations.forEach((chat) => {
    const dateStr = chat.updatedAt || chat.createdAt;
    if (!dateStr) return;

    const chatDate = new Date(dateStr);
    if (isNaN(chatDate.getTime())) return;

    chatDate.setHours(0, 0, 0, 0);

    const dayIndex = weekDates.findIndex((weekDate) =>
      weekDate.getTime() === chatDate.getTime()
    );

    if (dayIndex !== -1) {
      activityData[dayIndex].total++;
      if (chat.status === 'completed') {
        activityData[dayIndex].completed++;
      } else if (chat.status === 'pending') {
        activityData[dayIndex].pending++;
      }

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (chatDate >= sevenDaysAgo) {
        activityData[dayIndex].active++;
      }
    }
  });

  return activityData;
}

async function analyzeTopConsultations(conversations) {
  const stopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
    'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'más', 'pero',
    'sus', 'le', 'ya', 'o', 'este', 'si', 'sí', 'porque', 'esta', 'entre', 'cuando',
    'muy', 'sin', 'sobre', 'tambien', 'también', 'me', 'mi', 'te', 'tu', 'es', 'son',
    'conversacion', 'conversación', 'titulo', 'título', 'mensajes', 'hola', 'servicios', 'gracias'
  ]);

  const chatsToAnalyze = conversations.slice(0, 20);
  const counter = new Map();
  let processed = 0;

  for (const chat of chatsToAnalyze) {
    try {
      const response = await axios.get(
        `${BOTPRESS_URL}/v1/chat/messages`,
        {
          headers: getBotpressHeaders(),
          params: { conversationId: chat.id }
        }
      );

      const messages = response.data.messages || [];
      
      messages
        .filter(msg => msg.sender === 'user' || msg.direction === 'incoming')
        .forEach(msg => {
          const text = (msg.text || msg.payload?.text || '').toLowerCase();
          text
            .replace(/[^\w\sáéíóúñ]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word))
            .forEach(word => {
              counter.set(word, (counter.get(word) || 0) + 1);
            });
        });

      processed++;
    } catch (err) {
      console.error(`[Dashboard] Error analyzing chat ${chat.id}:`, err.message);
      processed++;
    }
  }

  return Array.from(counter.entries())
    .map(([t, c]) => ({ t, c }))
    .sort((a, b) => b.c - a.c)
    .slice(0, 5);
}

export const dashboardController = {
  getStats: async (req, res) => {
    try {
      console.log('[Dashboard] ========================================');
      console.log('[Dashboard] Iniciando sincronización...');
      console.log('[Dashboard] Fecha actual:', new Date().toISOString());
      
      const conversations = await fetchAllConversations();
      console.log(`[Dashboard] Conversaciones obtenidas de Botpress: ${conversations.length}`);

      if (conversations.length === 0) {
        console.warn('[Dashboard] No se obtuvieron conversaciones de Botpress');
      }
      
      const previousStats = await DashboardModel.getCurrentStats();
      console.log('[Dashboard] Stats previas en DB:', previousStats ? 'SI' : 'NO');
      
      const previousIds = previousStats && previousStats.conversaciones_ids ? previousStats.conversaciones_ids : [];
      console.log(`[Dashboard] IDs previos en DB: ${previousIds.length}`);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const activeUsers = new Set(
        conversations
          .filter(c => {
            const updatedAt = c.updatedAt ? new Date(c.updatedAt) : null;
            return updatedAt && updatedAt >= sevenDaysAgo;
          })
          .map(c => c.userId)
      ).size;

      const weeklyActivity = calculateWeeklyActivity(conversations);
      const topConsultations = await analyzeTopConsultations(conversations);

      const stats = {
        total: conversations.length,
        completed: conversations.filter(c => c.status === 'completed').length,
        pending: conversations.filter(c => c.status === 'pending').length,
        activeUsers: activeUsers,
        weeklyActivity: weeklyActivity,
        topConsultations: topConsultations,
        conversationIds: conversations.map(c => c.id)
      };

      console.log('[Dashboard] Stats calculadas:', {
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        activeUsers: stats.activeUsers,
        weeklyActivityDays: stats.weeklyActivity.length,
        topConsultationsCount: stats.topConsultations.length,
        conversationIdsCount: stats.conversationIds.length
      });

      try {
        console.log('[Dashboard] Intentando guardar en dashboard...');
        const saveResult = await DashboardModel.saveSync(stats, previousIds);
        console.log('[Dashboard] Resultado saveSync:', saveResult);
      } catch (dbError) {
        console.error('[Dashboard] ERROR guardando en dashboard:', dbError);
        console.error('[Dashboard] Stack:', dbError.stack);
      }

      try {
        console.log('[Dashboard] Intentando guardar en historial diario...');
        await DashboardModel.saveDailyHistory(stats);
        console.log('[Dashboard] Historial diario guardado OK');
      } catch (dbError) {
        console.error('[Dashboard] ERROR guardando en historial:', dbError);
        console.error('[Dashboard] Stack:', dbError.stack);
      }

      const currentIds = new Set(conversations.map(c => c.id));
      const previousIdsSet = new Set(previousIds);
      
      const nuevas = conversations.filter(c => !previousIdsSet.has(c.id));
      const eliminadasIds = previousIds.filter(id => !currentIds.has(id));

      console.log('[Dashboard] Cambios detectados:', {
        nuevas: nuevas.length,
        eliminadas: eliminadasIds.length
      });
      
      console.log('[Dashboard] ========================================');

      res.json({
        success: true,
        data: stats,
        sync: {
          synced: true,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0].substring(0, 8),
          cambios: {
            totalAnterior: previousIds.length,
            totalActual: conversations.length,
            diferencia: conversations.length - previousIds.length,
            nuevas: nuevas.length,
            eliminadas: eliminadasIds.length
          }
        }
      });
    } catch (error) {
      console.error('[Dashboard] ERROR GENERAL:', error);
      console.error('[Dashboard] Stack:', error.stack);
      res.status(500).json({ 
        error: 'Error obteniendo estadísticas', 
        details: error.message,
        stack: error.stack
      });
    }
  },

  getSyncHistory: async (req, res) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        `SELECT * FROM dashboard_sync_log 
         WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         ORDER BY created_at DESC`
      );
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error obteniendo historial de sincronización',
        details: error.message
      });
    }
  }
};