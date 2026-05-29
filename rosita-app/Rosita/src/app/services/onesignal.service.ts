// src/app/services/onesignal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OneSignalTemplate {
  id: string;
  name: string;
  titulo?: string;
  mensaje?: string;
  imagen_url?: string;
  enlace?: string;
  created_at?: string;
  updated_at?: string;
  contents?: { en?: string };
  headings?: { en?: string };
  big_picture?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {
  private apiUrl = `${environment.apiUrl}/onesignal`;

  constructor(private http: HttpClient) {}

  getTemplates(limit = 50, offset = 0, channel?: string): Observable<any> {
    let params: any = { limit, offset };
    if (channel) params.channel = channel;
    return this.http.get(`${this.apiUrl}/templates`, { params });
  }

  getTemplate(templateId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/${templateId}`);
  }

  createTemplate(templateData: {
    name: string;
    titulo: string;
    mensaje: string;
    imagen_url?: string;
    enlace?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates`, templateData);
  }

  updateTemplate(templateId: string, templateData: {
    name: string;
    titulo: string;
    mensaje: string;
    imagen_url?: string;
    enlace?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/templates/${templateId}`, templateData);
  }

  deleteTemplate(templateId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/templates/${templateId}`);
  }

  sendToAllSubscribers(templateId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-to-all`, { templateId });
  }

  sendToExternalId(templateId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-external`, { templateId });
  }
}