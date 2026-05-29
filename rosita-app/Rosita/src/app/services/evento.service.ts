import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Evento {
  id?: number;
  tipoevento: string;
  nombre: string;
  fecha: string;
  lugar: string;
  descripcion?: string;
  estado: string;
  observacion?: string;
}

export interface EstadisticasEventos {
  total: number;
  activos: number;
  inactivos: number;
  cancelados: number;
  proximos: number;
  pasados: number;
}

export interface Parroquia {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface TipoEvento {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface EstadoEvento {
  id: number;
  codigo: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private API_URL = `${environment.apiUrl}/eventos`;
  private TIPOS_URL = `${environment.apiUrl}/tipos-parametros`;

  private _tiposEvento = new BehaviorSubject<TipoEvento[]>([]);
  private _estadosEvento = new BehaviorSubject<EstadoEvento[]>([]);
  private _parroquias = new BehaviorSubject<Parroquia[]>([]);

  tiposEvento$ = this._tiposEvento.asObservable();
  estadosEvento$ = this._estadosEvento.asObservable();
  parroquias$ = this._parroquias.asObservable();

  constructor(private http: HttpClient) {}

  cargarParametros(): void {
    this.cargarTiposEvento();
    this.cargarEstadosEvento();
    this.cargarParroquias();
  }

  private cargarTiposEvento(): void {
    this.http.get<{ rows: TipoEvento[] }>(`${this.TIPOS_URL}/tipos-evento`).subscribe({
      next: (response) => this._tiposEvento.next(response.rows),
      error: () => this._tiposEvento.next([])
    });
  }

  private cargarEstadosEvento(): void {
    this.http.get<{ rows: EstadoEvento[] }>(`${this.TIPOS_URL}/estados-evento`).subscribe({
      next: (response) => this._estadosEvento.next(response.rows),
      error: () => this._estadosEvento.next([])
    });
  }

  private cargarParroquias(): void {
    this.http.get<{ rows: Parroquia[] }>(`${this.TIPOS_URL}/parroquias`).subscribe({
      next: (response) => this._parroquias.next(response.rows),
      error: () => this._parroquias.next([])
    });
  }

  get tiposEvento(): TipoEvento[] {
    return this._tiposEvento.getValue();
  }

  get estadosEvento(): EstadoEvento[] {
    return this._estadosEvento.getValue();
  }

  get parroquias(): Parroquia[] {
    return this._parroquias.getValue();
  }

  getTipoEventoDescripcion(codigo: string): string {
    const tipo = this._tiposEvento.getValue().find(t => t.codigo === codigo);
    return tipo ? tipo.descripcion : codigo;
  }

  getEstadoEventoDescripcion(codigo: string): string {
    const estado = this._estadosEvento.getValue().find(e => e.codigo === codigo);
    return estado ? estado.descripcion : codigo;
  }

  getParroquiaDescripcion(codigo: string): string {
    const parroquia = this._parroquias.getValue().find(p => p.codigo === codigo);
    return parroquia ? parroquia.descripcion : codigo;
  }

  getTipoEventoClase(codigo: string): string {
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

  getEstadoEventoClase(codigo: string): string {
    const clases: Record<string, string> = {
      'EP': 'bg-blue-100 text-blue-700 border-blue-200',
      'EC': 'bg-red-100 text-red-700 border-red-200',
      'EF': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return clases[codigo] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  getAll(): Observable<Evento[]> {
    return this.http.get<{ rows: Evento[] }>(this.API_URL).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<Evento | null> {
    return this.http.get<Evento>(`${this.API_URL}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  getByTipo(tipo: string): Observable<Evento[]> {
    return this.http.get<{ rows: Evento[] }>(`${this.API_URL}/tipo/${tipo}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getByFecha(fecha: string): Observable<Evento[]> {
    return this.http.get<{ rows: Evento[] }>(`${this.API_URL}/fecha/${fecha}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getByEstado(estado: string): Observable<Evento[]> {
    return this.http.get<{ rows: Evento[] }>(`${this.API_URL}/estado/${estado}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  create(evento: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.API_URL, evento).pipe(
      catchError(error => {
        alert(`Error al crear evento: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  update(id: number, evento: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.API_URL}/${id}`, evento).pipe(
      catchError(error => {
        alert(`Error al actualizar evento: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        alert(`Error al eliminar evento: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  search(query: string): Observable<Evento[]> {
    if (!query?.trim()) return this.getAll();
    return this.http.post<{ rows: Evento[] }>(`${this.API_URL}/search`, { query }).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getEstadisticas(): Observable<EstadisticasEventos> {
    return this.http.get<EstadisticasEventos>(`${this.API_URL}/estadisticas/general`).pipe(
      catchError(() => of({ total: 0, activos: 0, inactivos: 0, cancelados: 0, proximos: 0, pasados: 0 }))
    );
  }

  getProximos(dias: number = 30): Observable<Evento[]> {
    return this.http.get<{ rows: Evento[] }>(`${this.API_URL}/proximos/${dias}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
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
    const fechaEvento = new Date(fecha);
    return fechaEvento >= hoy;
  }
}