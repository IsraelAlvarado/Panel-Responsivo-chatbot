// src/app/rosita/rosita.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatsFacade } from './facades/chats.facade';
import { DashboardFacade } from './facades/dashboard.facade';
import { InscripcionesFacade } from './facades/inscripciones.facade';
import { GruposFacade } from './facades/grupos.facade';
import { FaqFacade } from './facades/faq.facade';
import { IntencionesFacade } from './facades/intenciones.facade';
import { NotificacionesFacade } from './facades/notificaciones.facade';
import { EventosFacade } from './facades/eventos.facade';

import { ChatService } from '../services/chat.service';
import { InscripcionService } from '../services/inscripcion.service';
import { GoogleDriveService } from '../services/google-drive.service';

@Component({
  selector: 'app-rosita',
  templateUrl: './rosita.component.html',
  styleUrls: ['./rosita.component.scss']
})
export class RositaComponent implements OnInit {
  Math = Math;
  Object = Object;

  private isBrowser: boolean;
  currentTab: 'dashboard' | 'chats' | 'config' = 'dashboard';

  constructor(
    public chatsFacade: ChatsFacade,
    public dashboardFacade: DashboardFacade,
    public inscripcionesFacade: InscripcionesFacade,
    public gruposFacade: GruposFacade,
    public faqFacade: FaqFacade,
    public intencionesFacade: IntencionesFacade,
    public notificacionesFacade: NotificacionesFacade,
    private chatService: ChatService,
    public inscripcionService: InscripcionService,
    private googleDriveService: GoogleDriveService,
    public eventosFacade: EventosFacade,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.chatsFacade.chats$.subscribe((chats: any[]) => {
      if (chats.length === 0) return;
      this.dashboardFacade.updateStats(chats);
      this.dashboardFacade.calculateWeeklyActivity(chats);
      this.dashboardFacade.analyzeConsultations(
        chats,
        (chatId: string) => this.chatService.getConversationMessages(chatId)
      );
    });

    this.chatsFacade.loadChats();
    this.faqFacade.initialize();
    this.gruposFacade.loadGrupos();
  }

  onTabChange(tab: 'dashboard' | 'chats' | 'config'): void {
    this.currentTab = tab;
  }

  onExportData(format: 'json' | 'xlsx'): void {
    if (format === 'xlsx') {
      this.exportToGoogleDrive();
    } else {
      this.chatsFacade.exportData(format);
    }
  }

  private async exportToGoogleDrive(): Promise<void> {
    const conversations = this.chatsFacade.chats;
    if (!conversations.length) {
      alert('No hay conversaciones para exportar');
      return;
    }
    try {
      const headers = ['ID', 'Usuario', 'Email', 'Titulo', 'Fecha', 'Mensajes', 'Estado'];
      const rows = conversations.map((chat: any) => ({
        id: chat.id,
        usuario: chat.userName,
        email: chat.userEmail,
        titulo: chat.title,
        fecha: chat.date,
        mensajes: chat.messageCount.toString(),
        estado: chat.status === 'completed' ? 'Completado' : 'Pendiente'
      }));
      const result = await this.googleDriveService.exportToGoogleDrive(
        rows,
        `conversaciones-rosita-${new Date().toISOString().split('T')[0]}`,
        headers
      );
      alert(`Archivo guardado en Google Drive:\n${result.fileName}\n\n${result.fileUrl}`);
      window.open(result.fileUrl, '_blank');
    } catch (error) {
      alert('Error al exportar a Google Drive. Verifica que hayas dado los permisos necesarios.');
    }
  }

  onChatClick(chatId: string): void {
    this.chatsFacade.openChat(chatId);
  }

  onFilterChange(status: 'all' | 'completed' | 'pending'): void {
    this.chatsFacade.filterChats(status);
  }

  onSearchChange(query: string): void {
    this.chatsFacade.searchChats(query);
  }

  onDeleteChat(chatId: string): void {
    this.chatsFacade.deleteConversation(chatId);
  }

  onModalClose(): void {
    this.chatsFacade.closeChat();
  }

  openFaqCrud(): void {
    this.faqFacade.openModal();
  }

  closeFaqCrud(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('fixed')) {
      this.faqFacade.closeModal();
    }
  }

  newFaq(): void {
    this.faqFacade.createFaq();
  }

  editFaq(faq: any): void {
    this.faqFacade.editFaq(faq);
  }

  saveFaq(): void {
    this.faqFacade.saveFaq();
  }

  deleteFaq(id: number): void {
    this.faqFacade.deleteFaq(id);
  }

  openGruposCrud(): void {
    this.gruposFacade.openModal();
  }

  closeGruposCrud(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('fixed')) {
      this.gruposFacade.closeModal();
    }
  }

  newGrupo(): void {
    this.gruposFacade.createGrupo();
  }

  editGrupo(grupo: any): void {
    this.gruposFacade.editGrupo(grupo);
  }

  saveGrupo(): void {
    this.gruposFacade.saveGrupo();
  }

  deleteGrupo(id: number): void {
    this.gruposFacade.deleteGrupo(id, () => {
      this.inscripcionesFacade.loadInscripciones();
      this.inscripcionesFacade.loadEstadisticas();
    });
  }

  viewInscripcionesGrupo(grupoId: number): void {
    this.gruposFacade.closeModal();
    this.inscripcionesFacade.openModal(grupoId);
  }

  openInscripcionesCrud(): void {
    this.inscripcionesFacade.openModal();
  }

  closeInscripcionesCrud(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('fixed')) {
      this.inscripcionesFacade.closeModal();
    }
  }

  newInscripcion(): void {
    this.inscripcionesFacade.createInscripcion();
  }

  viewInscripcion(inscripcion: any): void {
    this.inscripcionesFacade.viewInscripcion(inscripcion);
  }

  onEditInscripcion(inscripcion: any): void {
    this.inscripcionesFacade.editInscripcion(inscripcion);
  }

  saveInscripcion(): void {
    this.inscripcionesFacade.saveInscripcion();
    this.gruposFacade.loadGrupos();
  }

  updateEstadoInscripcion(id: number, estado: any): void {
    this.inscripcionesFacade.updateEstado(id, estado);
    this.gruposFacade.loadGrupos();
  }

  deleteInscripcion(id: number): void {
    this.inscripcionesFacade.deleteInscripcion(id);
    this.gruposFacade.loadGrupos();
  }

  filterInscripcionesByEstado(estado: string): void {
    this.inscripcionesFacade.filterByEstado(estado);
  }

  searchInscripciones(query: string): void {
    this.inscripcionesFacade.searchInscripciones(query);
  }

  exportInscripciones(formato: 'json' | 'xlsx'): void {
    this.inscripcionesFacade.exportInscripciones(formato);
  }

  openIntencionesCrud(): void {
    this.intencionesFacade.openModal();
  }

  closeIntencionesCrud(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('fixed')) {
      this.intencionesFacade.closeModal();
    }
  }

  newIntencion(): void {
    this.intencionesFacade.createIntencion();
  }

  editIntencion(intencion: any): void {
    this.intencionesFacade.editIntencion(intencion);
  }

  saveIntencion(): void {
    this.intencionesFacade.saveIntencion();
  }

  deleteIntencion(id: number): void {
    this.intencionesFacade.deleteIntencion(id);
  }

  updateEstadoIntencion(id: number, estado: string): void {
    this.intencionesFacade.updateEstado(id, estado);
  }

  filterIntencionesByEstado(estado: string): void {
    this.intencionesFacade.filterByEstado(estado);
  }

  searchIntenciones(query: string): void {
    this.intencionesFacade.searchIntenciones(query);
  }

  exportIntenciones(formato: 'json' | 'xlsx'): void {
    this.intencionesFacade.exportIntenciones(formato);
  }

  openPushNotificationsCrud(): void {
    this.notificacionesFacade.openModal();
  }

  closePushNotificationsCrud(): void {
    this.notificacionesFacade.closeModal();
  }

  onNotificationSelect(template: any): void {
    this.notificacionesFacade.selectTemplate(template);
  }

  onEditNotification(template: any): void {
    this.notificacionesFacade.editTemplate(template);
  }

  onSaveNotification(): void {
    this.notificacionesFacade.saveTemplate();
  }

  onDeleteNotification(id: string): void {
    this.notificacionesFacade.deleteTemplate(id);
  }

  onSendNotification(id: string): void {
    this.notificacionesFacade.enviarNotificacion(id);
  }

  onNotificationFieldChange(event: { field: any; value: any }): void {
    this.notificacionesFacade.updateFormField(event.field, event.value);
  }

  openEventosCrud(): void {
    this.eventosFacade.openModal();
  }

  closeEventosCrud(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('fixed')) {
      this.eventosFacade.closeModal();
    }
  }

  newEvento(): void {
    this.eventosFacade.createEvento();
  }

  editEvento(evento: any): void {
    this.eventosFacade.editEvento(evento);
  }

  saveEvento(): void {
    this.eventosFacade.saveEvento();
  }

  deleteEvento(id: number): void {
    this.eventosFacade.deleteEvento(id);
  }

  updateEstadoEvento(id: number, estado: string): void {
    this.eventosFacade.updateEstado(id, estado);
  }

  filterEventosByEstado(estado: string): void {
    this.eventosFacade.filterByEstado(estado);
  }

  filterEventosByTipo(tipo: string): void {
    this.eventosFacade.filterByTipo(tipo);
  }

  searchEventos(query: string): void {
    this.eventosFacade.searchEventos(query);
  }
}