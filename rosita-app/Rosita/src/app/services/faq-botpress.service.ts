// src/app/services/faq-botpress.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Faq {
  id_faq?: number;
  pregunta: string;
  respuesta: string;
  categoria: string;
  orden?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqBotpressService {
  private API_URL = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) {}

  ensureTableExists(): Observable<boolean> {
    return this.http.get<any>(`${environment.apiUrl}/health`).pipe(
      map(response => response.status === 'OK'),
      catchError(() => of(false))
    );
  }

  reloadConfig(): Observable<boolean> {
    return this.ensureTableExists();
  }

  getAll(): Observable<Faq[]> {
    return this.http.get<{ rows: Faq[] }>(this.API_URL).pipe(
      map(response => response.rows),
      catchError((error) => {
        console.error('Error cargando FAQs:', error);
        return of([]);
      })
    );
  }

  create(faq: Partial<Faq>): Observable<Faq> {
    return this.http.post<Faq>(this.API_URL, faq).pipe(
      catchError(error => {
        alert(`Error al crear FAQ: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  update(id: number, faq: Partial<Faq>): Observable<Faq> {
    return this.http.put<Faq>(`${this.API_URL}/${id}`, faq).pipe(
      catchError(error => {
        alert(`Error al actualizar FAQ: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        alert(`Error al eliminar FAQ: ${error.error?.details || error.message}`);
        throw error;
      })
    );
  }

  search(query: string): Observable<Faq[]> {
    if (!query?.trim()) return this.getAll();
    
    return this.http.post<{ rows: Faq[] }>(`${this.API_URL}/search`, { query }).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }

  filterByCategory(category: string): Observable<Faq[]> {
    return this.http.get<{ rows: Faq[] }>(`${this.API_URL}/category/${category}`).pipe(
      map(response => response.rows),
      catchError(() => of([]))
    );
  }
}