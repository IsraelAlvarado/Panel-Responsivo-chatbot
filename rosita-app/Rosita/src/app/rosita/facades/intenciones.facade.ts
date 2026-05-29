// src/app/rosita/facades/intenciones.facade.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Intencion {
  intencionId: number;
  fechaEmision: string;
  estado: 'EMITIDO' | 'NO_EMITIDO';
  fechaMisa: string;
  motivoMisa: string;
  personaOfrece: string;
  horarioMisa: string;
  detalleMisa: string;
  valor: number;
}

export interface EstadisticasIntenciones {
  total: number;
  emitidas: number;
  noEmitidas: number;
  valorTotal: number;
  valorRecaudado: number;
}

export interface TipoParametro {
  id: number;
  tipo: string;
  codigo: string;
  descripcion: string;
  gcp: string | null;
  gsm: string | null;
  cupo: number | null;
}

@Injectable()
export class IntencionesFacade {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  private _intenciones = new BehaviorSubject<Intencion[]>([]);
  private _filteredIntenciones = new BehaviorSubject<Intencion[]>([]);
  private _selectedIntencion = new BehaviorSubject<any>(null);
  private _estadisticas = new BehaviorSubject<EstadisticasIntenciones | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);
  private _showForm = new BehaviorSubject<boolean>(false);
  private _filterEstado = new BehaviorSubject<string>('all');
  private _searchQuery = new BehaviorSubject<string>('');

  private _horariosMisa = new BehaviorSubject<TipoParametro[]>([]);
  private _motivosMisa = new BehaviorSubject<TipoParametro[]>([]);

  get intenciones(): Intencion[] {
    return this._intenciones.getValue();
  }

  get filteredIntenciones(): Intencion[] {
    return this._filteredIntenciones.getValue();
  }

  get selectedIntencion(): any {
    return this._selectedIntencion.getValue();
  }

  get estadisticas(): EstadisticasIntenciones | null {
    return this._estadisticas.getValue();
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

  get filterEstado(): string {
    return this._filterEstado.getValue();
  }

  get searchQuery(): string {
    return this._searchQuery.getValue();
  }

  get horariosMisa(): TipoParametro[] {
    return this._horariosMisa.getValue();
  }

  get motivosMisa(): TipoParametro[] {
    return this._motivosMisa.getValue();
  }

  constructor(private http: HttpClient) {}

  loadParametros(): void {
    this.loadHorariosMisa();
    this.loadMotivosMisa();
  }

  private loadHorariosMisa(): void {
    this.http.get<{ rows: TipoParametro[] }>(`${this.apiUrl}/tipos-parametros/horarios-misa`).subscribe({
      next: (response) => {
        this._horariosMisa.next(response.rows);
      },
      error: (err) => {
        console.error('Error cargando horarios de misa:', err);
      }
    });
  }

  private loadMotivosMisa(): void {
    this.http.get<{ rows: TipoParametro[] }>(`${this.apiUrl}/tipos-parametros/motivos-misa`).subscribe({
      next: (response) => {
        this._motivosMisa.next(response.rows);
      },
      error: (err) => {
        console.error('Error cargando motivos de misa:', err);
      }
    });
  }

  getHorarioDescripcion(codigo: string): string {
    const horario = this._horariosMisa.getValue().find(h => h.codigo === codigo);
    return horario ? horario.descripcion : codigo;
  }

  getMotivoDescripcion(codigo: string): string {
    const motivo = this._motivosMisa.getValue().find(m => m.codigo === codigo);
    return motivo ? motivo.descripcion : codigo;
  }

  loadIntenciones(): void {
    this._loading.next(true);
    this.http.get<{ rows: Intencion[] }>(`${this.apiUrl}/intenciones`).subscribe({
      next: (response) => {
        this._intenciones.next(response.rows);
        this.applyFilters();
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
      }
    });
  }

  loadEstadisticas(): void {
    this.http.get<EstadisticasIntenciones>(`${this.apiUrl}/intenciones/estadisticas/general`).subscribe({
      next: (stats) => {
        this._estadisticas.next(stats);
      },
      error: (err) => {
        console.error('Error cargando estadisticas:', err);
        this._estadisticas.next({
          total: 0,
          emitidas: 0,
          noEmitidas: 0,
          valorTotal: 0,
          valorRecaudado: 0
        });
      }
    });
  }

  openModal(): void {
    this._showModal.next(true);
    this.loadParametros();
    this.loadIntenciones();
    this.loadEstadisticas();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._showForm.next(false);
    this._selectedIntencion.next(null);
    this._filterEstado.next('all');
    this._searchQuery.next('');
  }

  createIntencion(): void {
    const today = new Date().toISOString().split('T')[0];
    const primerHorario = this._horariosMisa.getValue()[0]?.codigo || 'H1';
    const primerMotivo = this._motivosMisa.getValue()[0]?.codigo || 'M1';

    this._selectedIntencion.next({
      fechaEmision: today,
      fechaMisa: today,
      horarioMisa: primerHorario,
      motivoMisa: primerMotivo,
      personaOfrece: '',
      detalleMisa: '',
      valor: 0,
      estado: 'NO_EMITIDO'
    });
    this._showForm.next(true);
  }

  editIntencion(intencion: Intencion): void {
    this._selectedIntencion.next({ ...intencion });
    this._showForm.next(true);
  }

  closeForm(): void {
    this._showForm.next(false);
    this._selectedIntencion.next(null);
  }

  saveIntencion(): void {
    const intencion = this.selectedIntencion;
    if (!intencion || !intencion.fechaMisa || !intencion.personaOfrece) {
      alert('Fecha de misa y persona que ofrece son requeridos');
      return;
    }

    this._loading.next(true);
    const isUpdate = !!(intencion.intencionId);
    const url = isUpdate
      ? `${this.apiUrl}/intenciones/${intencion.intencionId}`
      : `${this.apiUrl}/intenciones`;

    const request$ = isUpdate
      ? this.http.put(url, intencion)
      : this.http.post(url, intencion);

    request$.subscribe({
      next: () => {
        this.loadIntenciones();
        this.loadEstadisticas();
        this._showForm.next(false);
        this._selectedIntencion.next(null);
        this._loading.next(false);
      },
      error: () => {
        this._loading.next(false);
        alert('Error al guardar la intencion');
      }
    });
  }

  deleteIntencion(id: number): void {
    if (!confirm('Esta seguro de eliminar esta intencion?')) return;
    this._loading.next(true);
    this.http.delete(`${this.apiUrl}/intenciones/${id}`).subscribe({
      next: () => {
        this.loadIntenciones();
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
    this.http.put(`${this.apiUrl}/intenciones/${id}`, { estado }).subscribe({
      next: () => {
        this.loadIntenciones();
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

  searchIntenciones(query: string): void {
    this._searchQuery.next(query);
    if (query.length >= 2) {
      this._loading.next(true);
      this.http.post<{ rows: Intencion[] }>(`${this.apiUrl}/intenciones/search`, { query }).subscribe({
        next: (response) => {
          this._filteredIntenciones.next(response.rows);
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
    let filtered = this.intenciones;
    const estado = this.filterEstado;
    if (estado !== 'all') {
      filtered = filtered.filter((i: Intencion) => i.estado === estado);
    }
    this._filteredIntenciones.next(filtered);
  }

  exportIntenciones(formato: 'json' | 'xlsx' = 'json'): void {
    const data = this.filteredIntenciones.map(i => ({
      ...i,
      horarioDescripcion: this.getHorarioDescripcion(i.horarioMisa),
      motivoDescripcion: this.getMotivoDescripcion(i.motivoMisa)
    }));

    if (formato === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intenciones_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      EMITIDO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      NO_EMITIDO: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return classes[estado] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      EMITIDO: 'EMITIDO',
      NO_EMITIDO: 'NO EMITIDO'
    };
    return labels[estado] || estado;
  }

  formatCurrency(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor || 0);
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}