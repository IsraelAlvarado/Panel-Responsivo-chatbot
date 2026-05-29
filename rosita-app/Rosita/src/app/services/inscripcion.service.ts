// src/app/services/inscripcion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Feligres {
  id?: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string;
  ciudad_nacimiento?: string;
  localidad_nacimiento?: string;
  domicilio?: string;
  correo?: string;
  sexo?: string;
  nacionalidad?: string;
}

export interface GrupoParroquial {
  id_grupo?: number;
  nombre_grupo: string;
  descripcion?: string;
  horario_reunion?: string;
  requisitos?: string;
  total_inscritos?: number;
  pendientes?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface Inscripcion {
  id_inscripcion?: number;
  feligres_id: number;
  feligres_nombres?: string;
  feligres_apellidos?: string;
  feligres_cedula?: string;
  feligres_correo?: string;
  feligres_fecha_nacimiento?: string;
  feligres_ciudad_nacimiento?: string;
  feligres_localidad_nacimiento?: string;
  feligres_domicilio?: string;
  feligres_sexo?: string;
  feligres_nacionalidad?: string;
  tipo_servicio: string;
  grupo_id?: number;
  nombre_grupo?: string;
  datos_adicionales?: any;
  fecha_inscripcion?: string;
  fecha_actualizacion?: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}

export interface EstadisticasInscripciones {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private API_URL = `${environment.apiUrl}/inscripciones`;
  private FELIGRES_URL = `${environment.apiUrl}/feligreses`;
  private GRUPOS_URL = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) { }

  // ============ FELIGRES ============
  getAllFeligreses(): Observable<Feligres[]> {
    return this.http.get<{ rows: Feligres[] }>(this.FELIGRES_URL).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getFeligresById(id: number): Observable<Feligres | null> {
    return this.http.get<Feligres>(`${this.FELIGRES_URL}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  getFeligresByCedula(cedula: string): Observable<Feligres | null> {
    return this.http.get<Feligres>(`${this.FELIGRES_URL}/cedula/${cedula}`).pipe(
      catchError(() => of(null))
    );
  }

  searchFeligreses(query: string): Observable<Feligres[]> {
    return this.http.get<{ rows: Feligres[] }>(`${this.FELIGRES_URL}/search?q=${encodeURIComponent(query)}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  createFeligres(feligres: Partial<Feligres>): Observable<Feligres> {
    return this.http.post<Feligres>(this.FELIGRES_URL, feligres).pipe(
      catchError(error => {
        alert(`Error al crear feligres: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  updateFeligres(id: number, feligres: Partial<Feligres>): Observable<Feligres> {
    return this.http.put<Feligres>(`${this.FELIGRES_URL}/${id}`, feligres).pipe(
      catchError(error => {
        alert(`Error al actualizar feligres: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  deleteFeligres(id: number): Observable<void> {
    return this.http.delete<void>(`${this.FELIGRES_URL}/${id}`).pipe(
      catchError(error => {
        alert(`Error al eliminar feligres: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  // ============ GRUPOS ============
  getAllGrupos(): Observable<GrupoParroquial[]> {
    return this.http.get<{ rows: GrupoParroquial[] }>(this.GRUPOS_URL).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getGrupoById(id: number): Observable<GrupoParroquial | null> {
    return this.http.get<GrupoParroquial>(`${this.GRUPOS_URL}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  createGrupo(grupo: Partial<GrupoParroquial>): Observable<GrupoParroquial> {
    return this.http.post<GrupoParroquial>(this.GRUPOS_URL, grupo).pipe(
      catchError(error => {
        alert(`Error al crear grupo: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  updateGrupo(id: number, grupo: Partial<GrupoParroquial>): Observable<GrupoParroquial> {
    return this.http.put<GrupoParroquial>(`${this.GRUPOS_URL}/${id}`, grupo).pipe(
      catchError(error => {
        alert(`Error al actualizar grupo: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  deleteGrupo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.GRUPOS_URL}/${id}`).pipe(
      catchError(error => {
        alert(`Error al eliminar grupo: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  getAllInscripciones(): Observable<Inscripcion[]> {
    return this.http.get<{ rows: Inscripcion[] }>(this.API_URL).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getInscripcionesByTipo(tipo: string): Observable<Inscripcion[]> {
    return this.http.get<{ rows: Inscripcion[] }>(`${this.API_URL}/tipo/${tipo}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getInscripcionesByGrupo(grupoId: number): Observable<Inscripcion[]> {
    return this.http.get<{ rows: Inscripcion[] }>(`${this.API_URL}/grupo/${grupoId}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  getInscripcionById(id: number): Observable<Inscripcion | null> {
    return this.http.get<Inscripcion>(`${this.API_URL}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  checkDuplicateInscripcion(feligresId: number, tipoServicio: string, excludeId?: number): Observable<boolean> {
    return this.http.get<{ rows: Inscripcion[] }>(this.API_URL).pipe(
      map((response) => {
        return response.rows.some(i => 
          i.feligres_id === feligresId && 
          i.tipo_servicio === tipoServicio &&
          i.estado !== 'cancelada' &&
          i.id_inscripcion !== excludeId
        );
      }),
      catchError(() => of(false))
    );
  }

  createInscripcion(inscripcion: Partial<Inscripcion>): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.API_URL, inscripcion).pipe(
      catchError(error => {
        alert(`Error al crear inscripcion: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  updateInscripcion(id: number, inscripcion: Partial<Inscripcion>): Observable<Inscripcion> {
    return this.http.put<Inscripcion>(`${this.API_URL}/${id}`, inscripcion).pipe(
      catchError(error => {
        alert(`Error al actualizar inscripcion: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  deleteInscripcion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        alert(`Error al eliminar inscripcion: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  getEstadisticas(): Observable<EstadisticasInscripciones> {
    return this.http.get<EstadisticasInscripciones>(`${this.API_URL}/estadisticas/general`).pipe(
      catchError(() => of({ total: 0, pendientes: 0, confirmadas: 0, completadas: 0 }))
    );
  }

  // ============ UTILIDADES ============
  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'confirmada': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelada': 'bg-red-100 text-red-700 border-red-200',
      'completada': 'bg-green-100 text-green-700 border-green-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    };
    return textos[estado] || estado;
  }

  getTipoServicioTexto(tipo: string): string {
    const textos: { [key: string]: string } = {
      'bautizo': 'Bautizo',
      'matrimonio': 'Matrimonio',
      'primera_comunion': 'Primera Comunion',
      'confirmacion': 'Confirmacion',
      'grupo_parroquial': 'Grupo Parroquial'
    };
    return textos[tipo] || tipo;
  }

  getTipoServicioColor(tipo: string): string {
    const colores: { [key: string]: string } = {
      'bautizo': 'bg-blue-100 text-blue-700 border-blue-200',
      'matrimonio': 'bg-pink-100 text-pink-700 border-pink-200',
      'primera_comunion': 'bg-purple-100 text-purple-700 border-purple-200',
      'confirmacion': 'bg-orange-100 text-orange-700 border-orange-200',
      'grupo_parroquial': 'bg-green-100 text-green-700 border-green-200'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  formatearCampo(campo: string): string {
    return campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getNombreCompletoFeligres(feligres: Feligres | null): string {
    if (!feligres) return '';
    return `${feligres.nombres} ${feligres.apellidos}`.trim();
  }
}