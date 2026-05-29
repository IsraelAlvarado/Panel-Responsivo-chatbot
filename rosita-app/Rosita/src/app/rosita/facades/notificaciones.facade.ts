// src/app/rosita/facades/notificaciones.facade.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OneSignalService, OneSignalTemplate } from '../../services/onesignal.service';

export type { OneSignalTemplate };

@Injectable()
export class NotificacionesFacade {
  private _templates = new BehaviorSubject<OneSignalTemplate[]>([]);
  private _allTemplates = new BehaviorSubject<OneSignalTemplate[]>([]);
  private _selectedTemplate = new BehaviorSubject<OneSignalTemplate | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);
  private _showForm = new BehaviorSubject<boolean>(false);
  private _isEditing = new BehaviorSubject<boolean>(false);
  
  private _searchQuery = new BehaviorSubject<string>('');

  // Getter para templates filtrados
  get templatesFiltrados(): OneSignalTemplate[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.allTemplates;
    
    return this.allTemplates.filter((t: OneSignalTemplate) => 
      t.name?.toLowerCase().includes(query)
    );
  }

  // Getters sincronos
  get templates(): OneSignalTemplate[] {
    return this._templates.getValue();
  }

  get allTemplates(): OneSignalTemplate[] {
    return this._allTemplates.getValue();
  }

  get selectedTemplate(): OneSignalTemplate | null {
    return this._selectedTemplate.getValue();
  }

  get loading(): boolean {
    return this._loading.getValue();
  }

  get showModal(): boolean {
    return this._showModal.getValue();
  }

  get showForm(): boolean {
    return this._showForm.getValue();
  }

  get isEditing(): boolean {
    return this._isEditing.getValue();
  }

  get searchQuery(): string {
    return this._searchQuery.getValue();
  }

  constructor(private oneSignalService: OneSignalService) {}

  openModal(): void {
    this._showModal.next(true);
    this.loadTemplates();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._showForm.next(false);
    this._isEditing.next(false);
    this._selectedTemplate.next(null);
    this._searchQuery.next('');
  }

  createTemplate(): void {
    this._isEditing.next(false);
    this._selectedTemplate.next({
      id: '',
      name: '',
      titulo: '',
      mensaje: ''
    });
    this._showForm.next(true);
  }

  editTemplate(template: OneSignalTemplate): void {
    this._isEditing.next(true);
    this._selectedTemplate.next({
      id: template.id,
      name: template.name,
      titulo: template.titulo || template.headings?.en || '',
      mensaje: template.mensaje || template.contents?.en || ''
    });
    this._showForm.next(true);
  }

  selectTemplate(template: OneSignalTemplate): void {
    this._selectedTemplate.next(template);
    this._showForm.next(false);
  }

  closeForm(): void {
    this._showForm.next(false);
    this._isEditing.next(false);
    this._selectedTemplate.next(null);
  }

  loadTemplates(): void {
    this._loading.next(true);
    this.oneSignalService.getTemplates(100).subscribe({
      next: (response) => {
        const templates = response.data || [];
        this._allTemplates.next(templates);
        this._loading.next(false);
      },
      error: (error) => {
        console.error('Error cargando templates:', error);
        this._loading.next(false);
        this._allTemplates.next([]);
      }
    });
  }

  async saveTemplate(): Promise<void> {
    const template = this.selectedTemplate;
    if (!template) return;

    if (!template.name || !template.titulo || !template.mensaje) {
      alert('Nombre, titulo y mensaje son obligatorios');
      return;
    }

    this._loading.next(true);

    const templateData = {
      name: template.name,
      titulo: template.titulo,
      mensaje: template.mensaje,
      imagen_url: '',
      enlace: ''
    };

    if (this.isEditing && template.id) {
      this.oneSignalService.updateTemplate(template.id, templateData).subscribe({
        next: () => {
          alert('Template actualizado exitosamente');
          this.loadTemplates();
          this.closeForm();
          this._loading.next(false);
        },
        error: (error) => {
          console.error('Error actualizando template:', error);
          alert('Error al actualizar: ' + (error.error?.details?.errors?.[0] || 'Error desconocido'));
          this._loading.next(false);
        }
      });
    } else {
      this.oneSignalService.createTemplate(templateData).subscribe({
        next: () => {
          alert('Template creado exitosamente');
          this.loadTemplates();
          this.closeForm();
          this._loading.next(false);
        },
        error: (error) => {
          console.error('Error creando template:', error);
          alert('Error al crear: ' + (error.error?.details?.errors?.[0] || 'Error desconocido'));
          this._loading.next(false);
        }
      });
    }
  }

  deleteTemplate(id: string): void {
    if (!confirm('Eliminar este template de OneSignal?')) return;

    this._loading.next(true);
    this.oneSignalService.deleteTemplate(id).subscribe({
      next: () => {
        const filtered = this.allTemplates.filter((t: OneSignalTemplate) => t.id !== id);
        this._allTemplates.next(filtered);
        if (this.selectedTemplate?.id === id) {
          this._selectedTemplate.next(null);
        }
        this._loading.next(false);
      },
      error: (error) => {
        console.error('Error eliminando:', error);
        alert('Error al eliminar');
        this._loading.next(false);
      }
    });
  }

  enviarNotificacion(templateId: string): void {
    if (!confirm('ADVERTENCIA: Se enviara esta notificacion a TODOS los usuarios suscritos. Continuar?')) return;

    this._loading.next(true);
    
    this.oneSignalService.sendToAllSubscribers(templateId).subscribe({
      next: () => {
        alert('Notificacion enviada exitosamente');
        this._loading.next(false);
      },
      error: (error) => {
        console.error('Error enviando:', error);
        alert('Error al enviar: ' + (error.error?.details?.errors?.[0] || 'Error desconocido'));
        this._loading.next(false);
      }
    });
  }

  searchTemplates(query: string): void {
    this._searchQuery.next(query);
  }

  updateFormField(field: keyof OneSignalTemplate, value: any): void {
    const current = this.selectedTemplate;
    if (current) {
      this._selectedTemplate.next({ ...current, [field]: value });
    }
  }
}