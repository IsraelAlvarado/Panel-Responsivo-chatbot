// src/app/rosita/components/push-notifications-modal/push-notifications-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OneSignalTemplate } from '../../facades/notificaciones.facade';

@Component({
  selector: 'app-push-notifications-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './push-notifications-modal.component.html',
  styleUrls: ['./push-notifications-modal.component.scss']
})
export class PushNotificationsModalComponent {
  @Input() visible = false;
  @Input() loading = false;
  @Input() templates: OneSignalTemplate[] = [];
  @Input() selectedTemplate: OneSignalTemplate | null = null;
  @Input() showForm = false;
  @Input() isEditing = false;

  @Output() close = new EventEmitter<void>();
  @Output() newTemplate = new EventEmitter<void>();
  @Output() editTemplate = new EventEmitter<OneSignalTemplate>();
  @Output() selectTemplate = new EventEmitter<OneSignalTemplate>();
  @Output() saveTemplate = new EventEmitter<void>();
  @Output() deleteTemplate = new EventEmitter<string>();
  @Output() sendTemplate = new EventEmitter<string>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ field: keyof OneSignalTemplate; value: any }>();
  @Output() searchChange = new EventEmitter<string>();

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onNew(): void {
    this.newTemplate.emit();
  }

  onEdit(template: OneSignalTemplate): void {
    this.editTemplate.emit(template);
  }

  onSelect(template: OneSignalTemplate): void {
    this.selectTemplate.emit(template);
  }

  onSave(): void {
    if (!this.selectedTemplate?.titulo || !this.selectedTemplate?.mensaje) {
      alert('Titulo y mensaje son obligatorios');
      return;
    }
    this.saveTemplate.emit();
  }

  onDelete(): void {
    if (this.selectedTemplate?.id) {
      this.deleteTemplate.emit(this.selectedTemplate.id);
    }
  }

  onSendNow(): void {
    if (this.selectedTemplate?.id) {
      this.sendTemplate.emit(this.selectedTemplate.id);
    } else {
      alert('No se encontro el ID del template');
    }
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  onFieldChange(field: keyof OneSignalTemplate, value: any): void {
    this.fieldChange.emit({ field, value });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}