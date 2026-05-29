// src/app/rosita/facades/eventos.facade.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { 
  EventoService, 
  Evento, 
  EstadisticasEventos, 
  TipoEvento, 
  EstadoEvento, 
  Parroquia 
} from '../../services/evento.service';

@Injectable({
  providedIn: 'root'
})
export class EventosFacade {
  private _eventos = new BehaviorSubject<Evento[]>([]);
  private _filteredEventos = new BehaviorSubject<Evento[]>([]);
  private _selectedEvento = new BehaviorSubject<Partial<Evento> | null>(null);
  private _estadisticas = new BehaviorSubject<EstadisticasEventos | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);
  private _showForm = new BehaviorSubject<boolean>(false);
  private _filterEstado = new BehaviorSubject<string>('all');
  private _filterTipo = new BehaviorSubject<string>('all');
  private _searchQuery = new BehaviorSubject<string>('');

  get eventos(): Evento[] { return this._eventos.getValue(); }
  get filteredEventos(): Evento[] { return this._filteredEventos.getValue(); }
  get selectedEvento(): Partial<Evento> | null { return this._selectedEvento.getValue(); }
  get estadisticas(): EstadisticasEventos | null { return this._estadisticas.getValue(); }
  get loading(): boolean { return this._loading.getValue(); }
  get showModal(): boolean { return this._showModal.getValue(); }
  get showForm(): boolean { return this._showForm.getValue(); }
  get filterEstado(): string { return this._filterEstado.getValue(); }
  get filterTipo(): string { return this._filterTipo.getValue(); }
  get searchQuery(): string { return this._searchQuery.getValue(); }

  get tiposEvento(): TipoEvento[] { return this.eventoService.tiposEvento; }
  get estadosEvento(): EstadoEvento[] { return this.eventoService.estadosEvento; }
  get parroquias(): Parroquia[] { return this.eventoService.parroquias; }

  constructor(private eventoService: EventoService) {}

  getTipoEventoDescripcion(codigo: string): string {
    return this.eventoService.getTipoEventoDescripcion(codigo);
  }

  getEstadoEventoDescripcion(codigo: string): string {
    return this.eventoService.getEstadoEventoDescripcion(codigo);
  }

  getParroquiaDescripcion(codigo: string): string {
    return this.eventoService.getParroquiaDescripcion(codigo);
  }

  getTipoEventoClase(codigo: string): string {
    return this.eventoService.getTipoEventoClase(codigo);
  }

  getEstadoEventoClase(codigo: string): string {
    return this.eventoService.getEstadoEventoClase(codigo);
  }

  loadEventos(): void {
    this._loading.next(true);
    this.eventoService.getAll().subscribe({
      next: (data) => {
        this._eventos.next(data);
        this.applyFilters();
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
        alert('Error al cargar eventos.');
      }
    });
  }

  loadEstadisticas(): void {
    this.eventoService.getEstadisticas().subscribe({
      next: (stats) => this._estadisticas.next(stats),
      error: () => {}
    });
  }

  openModal(): void {
    this._showModal.next(true);
    this.eventoService.cargarParametros();
    this.loadEventos();
    this.loadEstadisticas();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._showForm.next(false);
    this._selectedEvento.next(null);
    this._filterEstado.next('all');
    this._filterTipo.next('all');
    this._searchQuery.next('');
  }

  createEvento(): void {
    const today = new Date().toISOString().split('T')[0];
    const primerTipo = this.tiposEvento[0]?.codigo || '';
    const primerEstado = this.estadosEvento[0]?.codigo || '';
    const primeraParroquia = this.parroquias[0]?.codigo || '';

    this._selectedEvento.next({
      tipoevento: primerTipo,
      nombre: '',
      fecha: today,
      lugar: primeraParroquia,
      descripcion: '',
      estado: primerEstado,
      observacion: ''
    });
    this._showForm.next(true);
  }

  editEvento(evento: Evento): void {
    let fechaFormateada = evento.fecha;
    if (fechaFormateada && typeof fechaFormateada === 'string') {
      fechaFormateada = fechaFormateada.split('T')[0];
    }
    
    this._selectedEvento.next({
      ...evento,
      fecha: fechaFormateada
    });
    this._showForm.next(true);
  }

  closeForm(): void {
    this._showForm.next(false);
    this._selectedEvento.next(null);
  }

  saveEvento(): void {
    const evento = this.selectedEvento;
    if (!evento || !evento.nombre || !evento.fecha || !evento.tipoevento) {
      alert('Nombre, fecha y tipo de evento son requeridos');
      return;
    }

    this._loading.next(true);
    const isUpdate = !!(evento.id);
    
    const request$ = isUpdate 
      ? this.eventoService.update(evento.id!, evento)
      : this.eventoService.create(evento);

    request$.subscribe({
      next: () => {
        this.loadEventos();
        this.loadEstadisticas();
        this._showForm.next(false);
        this._selectedEvento.next(null);
        this._loading.next(false);
        alert(isUpdate ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente');
      },
      error: () => {
        this._loading.next(false);
      }
    });
  }

  deleteEvento(id: number): void {
    if (!confirm('Esta seguro de eliminar este evento?')) return;
    this._loading.next(true);
    this.eventoService.delete(id).subscribe({
      next: () => {
        this.loadEventos();
        this.loadEstadisticas();
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
      }
    });
  }

  updateEstado(id: number, estado: string): void {
    this._loading.next(true);
    this.eventoService.update(id, { estado }).subscribe({
      next: () => {
        this.loadEventos();
        this.loadEstadisticas();
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
      }
    });
  }

  filterByEstado(estado: string): void {
    this._filterEstado.next(estado);
    this.applyFilters();
  }

  filterByTipo(tipo: string): void {
    this._filterTipo.next(tipo);
    this.applyFilters();
  }

  searchEventos(query: string): void {
    this._searchQuery.next(query);
    if (query.length >= 2) {
      this._loading.next(true);
      this.eventoService.search(query).subscribe({
        next: (results) => {
          this._filteredEventos.next(results);
          this._loading.next(false);
        },
        error: () => {
          this._loading.next(false);
        }
      });
    } else {
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    let filtered = this.eventos;
    const estado = this.filterEstado;
    const tipo = this.filterTipo;

    if (estado !== 'all') {
      filtered = filtered.filter((e: Evento) => e.estado === estado);
    }
    if (tipo !== 'all') {
      filtered = filtered.filter((e: Evento) => e.tipoevento === tipo);
    }

    this._filteredEventos.next(filtered);
  }

  exportEventos(formato: 'json' | 'xlsx' = 'json'): void {
    const data = this.filteredEventos.map(e => ({
      ...e,
      tipoDescripcion: this.getTipoEventoDescripcion(e.tipoevento),
      estadoDescripcion: this.getEstadoEventoDescripcion(e.estado),
      lugarDescripcion: this.getParroquiaDescripcion(e.lugar)
    }));
    
    if (formato === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eventos_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  formatearFecha(fecha: string): string {
    return this.eventoService.formatearFecha(fecha);
  }

  esEventoProximo(fecha: string): boolean {
    return this.eventoService.esEventoProximo(fecha);
  }
}