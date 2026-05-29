// src/app/rosita/services/chat.service.ts

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatListItem {
  id: string;
  userName: string;
  userEmail: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  status: 'completed' | 'pending';
  lastActivity: string;
  userInitial: string;
  colorClass: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  createdAt?: string;
}

export interface ChatDetail extends ChatListItem {
  messages: ChatMessage[];
}

interface UserData {
  nombre: string;
  correo: string;
  mensajeInicial: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private API_URL = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getConversations(): Observable<ChatListItem[]> {
    return this.http
      .get<any>(`${this.API_URL}/botpress/conversations`)
      .pipe(
        map((response) => this.transformBotpressData(response.conversations || response || [])),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener conversaciones:', error);
          return of([]);
        })
      );
  }

  getConversationMessages(conversationId: string): Observable<ChatDetail> {
    return this.http
      .get<any>(`${this.API_URL}/botpress/conversations/${conversationId}/messages`)
      .pipe(
        map((response) => this.transformMessageData(response, conversationId)),
        catchError((error) => {
          console.error('Error al obtener mensajes:', error);
          return of(this.getEmptyChatDetail(conversationId));
        })
      );
  }

  sendMessage(conversationId: string, messageText: string): Observable<any> {
    if (!messageText?.trim()) {
      return of({ error: 'El mensaje esta vacio' });
    }

    return this.http
      .post<any>(`${this.API_URL}/botpress/conversations/${conversationId}/messages`, { text: messageText })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error enviando mensaje:', error);
          return of({ error: 'No se pudo enviar el mensaje', details: error });
        })
      );
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.API_URL}/botpress/conversations/${conversationId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error eliminando conversacion:', error);
          return throwError(() => error);
        })
      );
  }

  exportToJSON(conversations: ChatListItem[]): void {
    if (!this.isBrowser) return;
    
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    this.downloadFile(blob, `conversaciones-rosita-${Date.now()}.json`);
  }

  exportToCSV(conversations: ChatListItem[]): void {
    if (!this.isBrowser) return;

    const headers = ['ID', 'Usuario', 'Email', 'Titulo', 'Fecha', 'Mensajes', 'Estado'];
    const rows = conversations.map((chat) => [
      chat.id,
      chat.userName,
      chat.userEmail,
      chat.title,
      chat.date,
      chat.messageCount.toString(),
      chat.status === 'completed' ? 'Completado' : 'Pendiente',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `conversaciones-rosita-${Date.now()}.csv`);
  }

  private transformBotpressData(conversations: any[]): ChatListItem[] {
    if (!conversations?.length) return [];

    const colors = ['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink'];

    return conversations.map((conv, index) => {
      const messageCount = parseInt(conv.tags?.['conversation-insights#message_count'] || '0', 10);
      const lastActivity = conv.updatedAt || conv.createdAt || new Date().toISOString();

      return {
        id: conv.id,
        userName: 'Sin nombre',
        userEmail: 'Sin correo',
        title: 'Nueva conversacion',
        preview: 'Sin mensajes',
        date: this.formatDate(conv.createdAt || new Date().toISOString()),
        messageCount,
        status: this.determineStatus(lastActivity),
        lastActivity: this.formatDateTime(lastActivity),
        userInitial: '?',
        colorClass: colors[index % colors.length],
      };
    });
  }

  private extractUserDataFromMessages(messages: any[]): UserData {
    const defaultData: UserData = {
      nombre: 'Sin nombre',
      correo: 'Sin correo',
      mensajeInicial: ''
    };

    if (!messages?.length) return defaultData;

    const userMessages = messages.filter((msg) => 
      msg.direction === 'incoming' || 
      (msg.authorId && msg.authorId !== 'bot')
    );

    let nombre = '';
    let correo = '';
    let mensajeInicial = '';

    const primerMensaje = userMessages[0];
    if (primerMensaje) {
      mensajeInicial = this.extractTextFromMessage(primerMensaje);
    }

    for (const msg of userMessages) {
      const text = this.extractTextFromMessage(msg);
      
      if (!correo && this.isValidEmail(text)) {
        correo = text;
        continue;
      }

      if (!nombre && text.length > 2 && text !== mensajeInicial && !this.isValidEmail(text)) {
        const palabrasComunes = ['hola', 'buenos', 'buenas', 'gracias', 'adios', 'si', 'no', 'ok'];
        if (!palabrasComunes.includes(text.toLowerCase())) {
          nombre = text;
        }
      }

      if (nombre && correo) break;
    }

    return {
      nombre: nombre || defaultData.nombre,
      correo: correo || defaultData.correo,
      mensajeInicial: mensajeInicial || defaultData.mensajeInicial
    };
  }

  private extractTextFromMessage(msg: any): string {
    if (!msg) return '';
    return msg.payload?.text || msg.text || msg.payload?.content || msg.content || '';
  }

  private isValidEmail(text: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text.trim());
  }

  private transformMessageData(data: any, conversationId: string): ChatDetail {
    let messages: any[] = [];

    if (data?.messages && Array.isArray(data.messages)) {
      messages = data.messages;
    } else if (Array.isArray(data)) {
      messages = data;
    } else if (data?.data && Array.isArray(data.data)) {
      messages = data.data;
    }

    const userData = this.extractUserDataFromMessages(messages);

    const transformedMessages: ChatMessage[] = messages.map((msg: any) => {
      const sender = this.determineSender(msg);
      const text = this.extractTextFromMessage(msg) || '[Mensaje sin contenido]';

      return {
        id: msg.id || Math.random().toString(),
        sender,
        text,
        timestamp: this.formatTime(msg.createdAt || msg.sentOn || new Date().toISOString()),
        createdAt: msg.createdAt || msg.sentOn || new Date().toISOString(),
      };
    });

    const sortedMessages = transformedMessages.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    let title = 'Conversacion';
    if (userData.mensajeInicial?.trim()) {
      title = this.generateTitle(userData.mensajeInicial);
    } else {
      const firstUserMsg = sortedMessages.find((m) => m.sender === 'user');
      if (firstUserMsg) {
        title = this.generateTitle(firstUserMsg.text);
      }
    }

    const lastMsg = sortedMessages[sortedMessages.length - 1];
    const preview = lastMsg ? lastMsg.text.substring(0, 80) : '';

    return {
      id: conversationId,
      userName: userData.nombre,
      userEmail: userData.correo,
      title,
      preview,
      date: this.formatDate(messages[0]?.createdAt || new Date().toISOString()),
      messageCount: sortedMessages.length,
      status: 'completed',
      lastActivity: this.formatDateTime(messages[messages.length - 1]?.createdAt || new Date().toISOString()),
      userInitial: userData.nombre !== 'Sin nombre' ? userData.nombre.charAt(0).toUpperCase() : '?',
      colorClass: 'blue',
      messages: sortedMessages,
    };
  }

  private determineSender(msg: any): 'bot' | 'user' {
    if (msg.direction) {
      return msg.direction === 'outgoing' ? 'bot' : 'user';
    }
    if (msg.authorId) {
      return msg.authorId === 'bot' ? 'bot' : 'user';
    }
    return 'user';
  }

  private getEmptyChatDetail(conversationId: string): ChatDetail {
    return {
      id: conversationId,
      userName: 'Sin nombre',
      userEmail: 'Sin correo',
      title: 'Sin mensajes',
      preview: '',
      date: '',
      messageCount: 0,
      status: 'completed',
      lastActivity: '',
      userInitial: '?',
      colorClass: 'blue',
      messages: [],
    };
  }

  private generateTitle(firstMessage: string): string {
    const cleanText = firstMessage.trim().substring(0, 40);
    return cleanText.length < firstMessage.trim().length ? cleanText + '...' : cleanText;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private determineStatus(updatedAt: string): 'completed' | 'pending' {
    const lastUpdate = new Date(updatedAt);
    const hoursSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursSince > 24 ? 'completed' : 'pending';
  }

  private downloadFile(blob: Blob, filename: string): void {
    if (!this.isBrowser) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}