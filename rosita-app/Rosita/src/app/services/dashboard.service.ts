import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  activeUsers: number;
  weeklyActivity: any[];
  topConsultations: any[];
  conversationIds?: string[];
}

export interface SyncInfo {
  synced: boolean;
  fecha: string;
  hora: string;
  cambios: {
    totalAnterior: number;
    totalActual: number;
    diferencia: number;
    nuevas: number;
    eliminadas: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: DashboardStats; sync: SyncInfo }> {
    return this.http.get<{ success: boolean; data: DashboardStats; sync: SyncInfo }>(`${this.apiUrl}/stats`);
  }

  getSyncHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sync-history`);
  }
}