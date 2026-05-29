// src/app/rosita/components/inscripciones-modal/inscripciones-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionService, Inscripcion, GrupoParroquial } from '../../../services/inscripcion.service';

export interface EstadisticasInscripciones {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
}

export interface UpdateEstadoEvent {
  id: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

@Component({
  selector: 'app-inscripciones-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones-modal.component.html',
  styleUrls: ['./inscripciones-modal.component.scss']
})
export class InscripcionesModalComponent {
  Object = Object;
  
  @Input() visible = false;
  @Input() inscripciones: Inscripcion[] = [];
  @Input() loading = false;
  @Input() selectedInscripcion: any = null;
  @Input() grupos: GrupoParroquial[] = [];
  @Input() estadisticas: EstadisticasInscripciones = {
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    completadas: 0
  };
  @Input() grupoSeleccionado: number | null = null;
  @Input() viewMode: 'view' | 'edit' | 'create' = 'create';
  
  @Output() close = new EventEmitter<void>();
  @Output() newInscripcion = new EventEmitter<void>();
  @Output() viewInscripcion = new EventEmitter<Inscripcion>();
  @Output() editInscripcion = new EventEmitter<Inscripcion>();
  @Output() deleteInscripcion = new EventEmitter<number>();
  @Output() saveInscripcion = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() updateEstado = new EventEmitter<UpdateEstadoEvent>();
  @Output() filterByEstado = new EventEmitter<string>();
  @Output() search = new EventEmitter<Event>();
  @Output() export = new EventEmitter<'xlsx' | 'json'>();

  constructor(public inscripcionService: InscripcionService) {}

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onFormBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeForm.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onNewInscripcion(): void {
    this.viewMode = 'create';
    this.newInscripcion.emit();
  }

  onViewInscripcion(inscripcion: Inscripcion): void {
    this.viewMode = 'view';
    this.viewInscripcion.emit(inscripcion);
  }

  onEditInscripcion(inscripcion: Inscripcion): void {
    this.viewMode = 'edit';
    this.editInscripcion.emit(inscripcion);
  }

  onDeleteInscripcion(id: number | undefined): void {
    if (!id) return;
    this.deleteInscripcion.emit(id);
  }

  onSaveInscripcion(): void {
    this.saveInscripcion.emit();
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  onUpdateEstado(id: number | undefined, estado: string): void {
    if (!id) return;
    const validEstados = ['pendiente', 'confirmada', 'cancelada', 'completada'] as const;
    if (validEstados.includes(estado as any)) {
      this.updateEstado.emit({ 
        id, 
        estado: estado as 'pendiente' | 'confirmada' | 'cancelada' | 'completada' 
      });
    }
  }

  onFilterByEstado(estado: string): void {
    this.filterByEstado.emit(estado);
  }

  onSearch(event: Event): void {
    this.search.emit(event);
  }

  onExport(format: 'xlsx' | 'json'): void {
    this.export.emit(format);
  }

  isSaveDisabled(): boolean {
    return !this.selectedInscripcion?.feligres_nombres || !this.selectedInscripcion?.feligres_apellidos || !this.selectedInscripcion?.tipo_servicio;
  }

  isViewing(): boolean {
    return this.viewMode === 'view';
  }

  isEditing(): boolean {
    return this.viewMode === 'edit';
  }

  isCreating(): boolean {
    return this.viewMode === 'create';
  }

  getSafeString(value: string | undefined): string {
    return value || '';
  }

  switchToEdit(): void {
    this.viewMode = 'edit';
  }
}