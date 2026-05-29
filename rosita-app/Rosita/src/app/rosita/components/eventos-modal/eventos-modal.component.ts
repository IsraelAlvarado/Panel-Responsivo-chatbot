// src/app/rosita/components/eventos-modal/eventos-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Evento, 
  TipoEvento, 
  EstadoEvento, 
  Parroquia 
} from '../../../services/evento.service';

@Component({
  selector: 'app-eventos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos-modal.component.html',
  styleUrls: ['./eventos-modal.component.scss']
})
export class EventosModalComponent {
  @Input() visible = false;
  @Input() eventos: Evento[] = [];
  @Input() loading = false;
  @Input() selectedEvento: Partial<Evento> | null = null;
  @Input() estadisticas: any = null;
  @Input() tiposEvento: TipoEvento[] = [];
  @Input() estadosEvento: EstadoEvento[] = [];
  @Input() parroquias: Parroquia[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() newEvento = new EventEmitter<void>();
  @Output() editEvento = new EventEmitter<Evento>();
  @Output() deleteEvento = new EventEmitter<number>();
  @Output() saveEvento = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() updateEstado = new EventEmitter<{ id: number; estado: string }>();
  @Output() filterByEstado = new EventEmitter<string>();
  @Output() filterByTipo = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  filtroEstado = 'all';
  filtroTipo = 'all';
  searchText = '';

  getTipoDescripcion(codigo: string): string {
    const tipo = this.tiposEvento.find(t => t.codigo === codigo);
    return tipo ? tipo.descripcion : codigo;
  }

  getEstadoDescripcion(codigo: string): string {
    const estado = this.estadosEvento.find(e => e.codigo === codigo);
    return estado ? estado.descripcion : codigo;
  }

  getParroquiaDescripcion(codigo: string): string {
    const parroquia = this.parroquias.find(p => p.codigo === codigo);
    return parroquia ? parroquia.descripcion : codigo;
  }

  getTipoClase(codigo: string): string {
    const clases: Record<string, string> = {
      'MD': 'bg-purple-100 text-purple-700',
      'CV': 'bg-green-100 text-green-700',
      'AP': 'bg-blue-100 text-blue-700',
      'SC': 'bg-yellow-100 text-yellow-700',
      'EV1': 'bg-pink-100 text-pink-700',
      'EV2': 'bg-red-100 text-red-700'
    };
    return clases[codigo] || 'bg-gray-100 text-gray-700';
  }

  getEstadoClase(codigo: string): string {
    const clases: Record<string, string> = {
      'EP': 'bg-blue-100 text-blue-700 border-blue-200',
      'EC': 'bg-red-100 text-red-700 border-red-200',
      'EF': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return clases[codigo] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  onFormBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeForm.emit();
  }

  onClose(): void { this.close.emit(); }
  onNewEvento(): void { this.newEvento.emit(); }
  onEditEvento(evento: Evento): void { this.editEvento.emit(evento); }
  onDeleteEvento(id: number): void { this.deleteEvento.emit(id); }
  onSaveEvento(): void { this.saveEvento.emit(); }
  onCloseForm(): void { this.closeForm.emit(); }

  onUpdateEstado(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.updateEstado.emit({ id, estado: select.value });
  }

  onFilterEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterByEstado.emit(select.value);
  }

  onFilterTipoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterByTipo.emit(select.value);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
  }

  isSaveDisabled(): boolean {
    return !this.selectedEvento?.nombre || !this.selectedEvento?.fecha || !this.selectedEvento?.tipoevento;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  esEventoProximo(fecha: string): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(fecha) >= hoy;
  }
}