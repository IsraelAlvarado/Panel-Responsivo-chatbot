// src/app/rosita/facades/chats.facade.ts

import { Injectable } from '@angular/core';
import { ChatService, ChatListItem, ChatDetail } from '../../services/chat.service';
import { forkJoin, of, BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

declare global {
  interface Window {
    botpressWebChat?: {
      sendEvent: (event: { type: string }) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ChatsFacade {
  private _chats = new BehaviorSubject<ChatListItem[]>([]);
  private _filteredChats = new BehaviorSubject<ChatListItem[]>([]);
  private _selectedChat = new BehaviorSubject<ChatDetail | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _loadingDetails = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);
  private _deletingChat = new BehaviorSubject<string | null>(null);
  
  private _replyText = new BehaviorSubject<string>('');
  private _sendingMessage = new BehaviorSubject<boolean>(false);

  chats$ = this._chats.asObservable();
  filteredChats$ = this._filteredChats.asObservable();
  selectedChat$ = this._selectedChat.asObservable();
  loading$ = this._loading.asObservable();
  loadingDetails$ = this._loadingDetails.asObservable();
  showModal$ = this._showModal.asObservable();
  deletingChat$ = this._deletingChat.asObservable();
  replyText$ = this._replyText.asObservable();
  sendingMessage$ = this._sendingMessage.asObservable();

  // Getters para acceso sincrono
  get chats(): ChatListItem[] {
    return this._chats.getValue();
  }

  get filteredChats(): ChatListItem[] {
    return this._filteredChats.getValue();
  }

  get selectedChat(): ChatDetail | null {
    return this._selectedChat.getValue();
  }

  get loading(): boolean {
    return this._loading.getValue();
  }

  get loadingDetails(): boolean {
    return this._loadingDetails.getValue();
  }

  get showModal(): boolean {
    return this._showModal.getValue();
  }

  get deletingChat(): string | null {
    return this._deletingChat.getValue();
  }

  get replyText(): string {
    return this._replyText.getValue();
  }

  get sendingMessage(): boolean {
    return this._sendingMessage.getValue();
  }

  constructor(private chatService: ChatService) {}

  loadChats(): void {
    this._loading.next(true);

    this.chatService.getConversations().subscribe({
      next: (data) => {
        this._chats.next(data);
        this._filteredChats.next(data);
        if (data.length > 0) {
          this.loadChatDetails(data);
        } else {
          this._loading.next(false);
        }
      },
      error: (error) => {
        console.error('Error al cargar conversaciones:', error);
        this._loading.next(false);
      }
    });
  }

  private loadChatDetails(chatList: ChatListItem[]): void {
    this._loadingDetails.next(true);
    
    const detailRequests = chatList.map(chat => 
      this.chatService.getConversationMessages(chat.id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(detailRequests).pipe(
      finalize(() => {
        this._loading.next(false);
        this._loadingDetails.next(false);
      })
    ).subscribe({
      next: (details) => {
        const detailsMap = new Map<string, ChatDetail>();
        
        details.forEach((detail, index) => {
          if (detail) {
            const chatId = chatList[index].id;
            detailsMap.set(chatId, detail);
          }
        });

        this.updateChatsWithDetails(detailsMap);
      }
    });
  }

  private updateChatsWithDetails(detailsMap: Map<string, ChatDetail>): void {
    const updateChat = (chat: ChatListItem): ChatListItem => {
      const detail = detailsMap.get(chat.id);
      if (!detail) return chat;

      return {
        ...chat,
        messageCount: detail.messageCount,
        title: detail.title,
        preview: detail.preview,
        userName: detail.userName,
        userEmail: detail.userEmail,
        userInitial: detail.userInitial
      };
    };

    this._chats.next(this.chats.map(updateChat));
    this._filteredChats.next(this.filteredChats.map(updateChat));
  }

  filterChats(status: 'all' | 'completed' | 'pending'): void {
    const allChats = this.chats;
    this._filteredChats.next(
      status === 'all' ? allChats : allChats.filter((c: ChatListItem) => c.status === status)
    );
  }

  searchChats(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    const allChats = this.chats;
    
    this._filteredChats.next(
      normalizedQuery
        ? allChats.filter((chat: ChatListItem) =>
            chat.userName.toLowerCase().includes(normalizedQuery) ||
            chat.userEmail.toLowerCase().includes(normalizedQuery) ||
            chat.title.toLowerCase().includes(normalizedQuery) ||
            chat.preview.toLowerCase().includes(normalizedQuery)
          )
        : allChats
    );
  }

  openChat(chatId: string): void {
    this._loading.next(true);
    this._replyText.next('');

    this.chatService.getConversationMessages(chatId).subscribe({
      next: (chatDetail) => {
        this._selectedChat.next(chatDetail);
        this._showModal.next(true);
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
        alert('Error al cargar los mensajes');
      }
    });
  }

  closeChat(): void {
    this._showModal.next(false);
    this._selectedChat.next(null);
    this._replyText.next('');
  }

  deleteConversation(conversationId: string): void {
    if (!confirm('¿Estas seguro de que deseas eliminar esta conversacion? Esta accion no se puede deshacer.')) {
      return;
    }

    this._deletingChat.next(conversationId);
    this._loading.next(true);

    this.chatService.deleteConversation(conversationId).subscribe({
      next: (response) => {
        console.log(`[ChatsFacade] Conversacion ${conversationId} eliminada:`, response);
        
        this.clearBotpressStorage(conversationId);
        
        this._chats.next(this.chats.filter((c: ChatListItem) => c.id !== conversationId));
        this._filteredChats.next(this.filteredChats.filter((c: ChatListItem) => c.id !== conversationId));
        
        if (this.selectedChat?.id === conversationId) {
          this.closeChat();
        }

        this._loading.next(false);
        this._deletingChat.next(null);
        
        alert('Conversacion eliminada correctamente de Botpress');
      },
      error: (err) => {
        console.error('[ChatsFacade] Error al eliminar:', err);
        this._loading.next(false);
        this._deletingChat.next(null);
        
        const errorMsg = err.error?.details?.message || err.message || 'Error desconocido';
        alert(`Error al eliminar: ${errorMsg}`);
      }
    });
  }

  private clearBotpressStorage(conversationId: string): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('bp') ||
          key.startsWith('botpress') ||
          key.includes('webchat') ||
          key.includes(conversationId)
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      const sessionKeys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('bp') ||
          key.startsWith('botpress') ||
          key.includes('webchat') ||
          key.includes(conversationId)
        )) {
          sessionKeys.push(key);
        }
      }
      sessionKeys.forEach(key => sessionStorage.removeItem(key));

      if (window.botpressWebChat) {
        window.botpressWebChat.sendEvent({ type: 'reset' });
      }
    } catch (e) {
      console.warn('[ChatsFacade] Error limpiando storage:', e);
    }
  }

  isDeleting(chatId: string): boolean {
    return this.deletingChat === chatId;
  }

  exportData(format: 'json' | 'csv'): void {
    const conversations = this.chats;
    if (!conversations.length) {
      alert('No hay conversaciones para exportar');
      return;
    }

    if (format === 'json') {
      this.chatService.exportToJSON(conversations);
    } else {
      this.chatService.exportToCSV(conversations);
    }
  }
}