// src/app/rosita/components/intenciones-modal/intenciones-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Intencion, EstadisticasIntenciones, IntencionesFacade, TipoParametro } from '../../facades/intenciones.facade';

@Component({
  selector: 'app-intenciones-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './intenciones-modal.component.html',
  styleUrls: ['./intenciones-modal.component.scss']
})
export class IntencionesModalComponent {
  @Input() visible = false;
  @Input() intenciones: Intencion[] = [];
  @Input() loading = false;
  @Input() selectedIntencion: Intencion | Partial<Intencion> | null = null;
  @Input() estadisticas: EstadisticasIntenciones | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() newIntencion = new EventEmitter<void>();
  @Output() editIntencion = new EventEmitter<Intencion>();
  @Output() deleteIntencion = new EventEmitter<number>();
  @Output() saveIntencion = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() updateEstado = new EventEmitter<{ id: number; estado: string }>();
  @Output() filterByEstado = new EventEmitter<string>();
  @Output() search = new EventEmitter<Event>();
  @Output() export = new EventEmitter<'json' | 'xlsx'>();

  Math = Math;

  constructor(public facade: IntencionesFacade) {}

  getHorarioDescripcion(codigo: string): string {
    return this.facade.getHorarioDescripcion(codigo);
  }

  getMotivoDescripcion(codigo: string): string {
    return this.facade.getMotivoDescripcion(codigo);
  }

  getEstadoClass(estado: string): string {
    return this.facade.getEstadoClass(estado);
  }

  getEstadoLabel(estado: string): string {
    return this.facade.getEstadoLabel(estado);
  }

  formatCurrency(valor: number): string {
    return this.facade.formatCurrency(valor);
  }

  formatDate(fecha: string): string {
    return this.facade.formatDate(fecha);
  }

  onClose(): void {
    this.close.emit();
  }

  onNewIntencion(): void {
    this.newIntencion.emit();
  }

  onEditIntencion(intencion: Intencion): void {
    this.editIntencion.emit(intencion);
  }

  onDeleteIntencion(id: number): void {
    this.deleteIntencion.emit(id);
  }

  onSaveIntencion(): void {
    this.saveIntencion.emit();
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  onUpdateEstado(id: number, estado: string): void {
    this.updateEstado.emit({ id, estado });
  }

  onFilterByEstado(estado: string): void {
    this.filterByEstado.emit(estado);
  }

  onSearch(event: Event): void {
    this.search.emit(event);
  }

  onExport(formato: 'json' | 'xlsx'): void {
    this.export.emit(formato);
  }
}