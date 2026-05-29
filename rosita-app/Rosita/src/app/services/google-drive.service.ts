// src/app/services/google-drive.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GOOGLE_DRIVE_CONFIG } from '../config/google-drive.config';

declare const google: any;
declare const gapi: any;

interface XLSXModule {
  utils: any;
  write: any;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private tokenClient: any;
  private accessToken: string | null = null;
  private pickerInited = false;
  private gisInited = false;
  private gapiInited = false;
  private xlsxLoaded = false;
  private isBrowser: boolean;
  private initializationPromise: Promise<void> | null = null;
  private XLSX: XLSXModule | null = null;

  private config = GOOGLE_DRIVE_CONFIG;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async initializeService(): Promise<void> {
    if (!this.isBrowser) {
      console.warn('[Google Drive] Servicio no disponible en servidor');
      return;
    }

    if (!this.config.clientId || !this.config.apiKey) {
      console.error('[Google Drive]  Falta configuración: clientId o apiKey');
      throw new Error('Google Drive no está completamente configurado. Revisa google-drive.config.ts');
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      console.log('[Google Drive]  Iniciando servicio...');
      
      await this.loadXLSX();
      
      await this.loadGoogleAPIs();
      
      console.log('[Google Drive]  Servicio inicializado correctamente');
    })();

    return this.initializationPromise;
  }

  private async loadXLSX(): Promise<void> {
    if (this.xlsxLoaded && this.XLSX) {
      console.log('[Google Drive]  XLSX ya estaba cargado');
      return;
    }

    try {
      console.log('[Google Drive]  Cargando librería XLSX...');
      const module: any = await import('xlsx');
      // Fix para Angular 15 / xlsx - usar la exportación por defecto o el módulo completo
      this.XLSX = module.default || module;
      this.xlsxLoaded = true;
      console.log('[Google Drive]  XLSX cargado correctamente');
    } catch (err) {
      console.error('[Google Drive]  Error cargando XLSX:', err);
      throw new Error('No se pudo cargar la librería XLSX. Asegúrate de tener instalado: npm install xlsx');
    }
  }

  private async loadGoogleAPIs(): Promise<void> {
    if (!this.isBrowser) return;

    console.log('[Google Drive]  Cargando Google APIs...');

    await Promise.all([
      this.loadGapi(),
      this.loadGIS()
    ]);

    await this.waitForInitialization();
  }

  private loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined' && gapi.load) {
        console.log('[Google Drive]  gapi ya está disponible');
        this.initializeGapi().then(resolve).catch(reject);
        return;
      }

      if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
        console.log('[Google Drive]  Script gapi ya cargado, esperando...');
        this.waitForGapi().then(() => this.initializeGapi()).then(resolve).catch(reject);
        return;
      }

      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      
      gapiScript.onload = () => {
        console.log('[Google Drive]  Script gapi.js cargado');
        this.initializeGapi().then(resolve).catch(reject);
      };
      
      gapiScript.onerror = () => {
        console.error('[Google Drive]  Error cargando gapi.js');
        reject(new Error('Error cargando Google API'));
      };
      
      document.head.appendChild(gapiScript);
    });
  }

  private waitForGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = 10000;
      const start = Date.now();
      
      const check = () => {
        if (typeof gapi !== 'undefined' && gapi.load) {
          resolve();
          return;
        }
        
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout esperando gapi'));
          return;
        }
        
        setTimeout(check, 100);
      };
      
      check();
    });
  }

  private async initializeGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!gapi || !gapi.load) {
        reject(new Error('gapi no está disponible'));
        return;
      }

      console.log('[Google Drive]  Inicializando GAPI...');

      gapi.load('client:picker', {
        callback: async () => {
          try {
            await gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            
            this.gapiInited = true;
            this.pickerInited = true;
            console.log('[Google Drive]  GAPI inicializada correctamente');
            resolve();
          } catch (error) {
            console.error('[Google Drive]  Error inicializando GAPI:', error);
            reject(error);
          }
        },
        onerror: (error: any) => {
          console.error('[Google Drive]  Error cargando módulos GAPI:', error);
          reject(error);
        },
        timeout: 10000,
        ontimeout: () => {
          console.error('[Google Drive]  Timeout cargando GAPI');
          reject(new Error('Timeout cargando GAPI'));
        }
      });
    });
  }

  private loadGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.accounts) {
        console.log('[Google Drive]  GIS ya está disponible');
        this.initializeGIS();
        resolve();
        return;
      }

      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        console.log('[Google Drive]  Script GIS ya cargado, esperando...');
        this.waitForGIS().then(resolve).catch(reject);
        return;
      }

      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.defer = true;
      
      gisScript.onload = () => {
        console.log('[Google Drive]  Script GIS cargado');
        this.initializeGIS();
        resolve();
      };
      
      gisScript.onerror = () => {
        console.error('[Google Drive]  Error cargando GIS');
        reject(new Error('Error cargando Google Identity Services'));
      };
      
      document.head.appendChild(gisScript);
    });
  }

  private waitForGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = 10000;
      const start = Date.now();
      
      const check = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          this.initializeGIS();
          resolve();
          return;
        }
        
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout esperando GIS'));
          return;
        }
        
        setTimeout(check, 100);
      };
      
      check();
    });
  }

  private initializeGIS(): void {
    try {
      console.log('[Google Drive]  Inicializando GIS...');
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes.join(' '),
        callback: '',
      });
      this.gisInited = true;
      console.log('[Google Drive]  GIS inicializado');
    } catch (error) {
      console.error('[Google Drive]  Error inicializando GIS:', error);
    }
  }

  private async waitForInitialization(): Promise<void> {
    const timeout = 15000;
    const start = Date.now();

    while ((!this.pickerInited || !this.gisInited || !this.gapiInited) && 
           (Date.now() - start < timeout)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.pickerInited || !this.gisInited || !this.gapiInited) {
      const missing = [];
      if (!this.pickerInited) missing.push('Picker');
      if (!this.gisInited) missing.push('GIS');
      if (!this.gapiInited) missing.push('GAPI');
      
      const errorMsg = `Faltan APIs: ${missing.join(', ')}`;
      console.error(`[Google Drive]  ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isBrowser) {
      throw new Error('Google Drive solo disponible en navegador');
    }

    if (!this.initializationPromise) {
      await this.initializeService();
      return;
    }

    try {
      await this.initializationPromise;
    } catch (error) {
      this.initializationPromise = null;
      await this.initializeService();
    }

    if (!this.XLSX || !this.xlsxLoaded) {
      console.log('[Google Drive]  Recargando XLSX...');
      await this.loadXLSX();
    }

    if (!this.pickerInited || !this.gisInited || !this.gapiInited) {
      throw new Error('Servicio de Google Drive no está completamente inicializado');
    }
  }

  private async requestAccessToken(): Promise<void> {
    if (!this.isBrowser) throw new Error('Solo disponible en navegador');
    if (!this.tokenClient) throw new Error('Token client no inicializado');

    console.log('[Google Drive]  Solicitando autorización...');

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            console.error('[Google Drive]  Error obteniendo token:', response);
            reject(new Error(response.error_description || 'Error obteniendo token'));
            return;
          }
          this.accessToken = response.access_token;
          console.log('[Google Drive]  Token obtenido correctamente');
          resolve();
        };

        this.tokenClient.requestAccessToken({ 
          prompt: this.accessToken ? '' : 'consent' 
        });
      } catch (error) {
        console.error('[Google Drive]  Error en requestAccessToken:', error);
        reject(error);
      }
    });
  }

  async openFolderPicker(): Promise<string | null> {
    await this.ensureInitialized();

    if (!this.accessToken) {
      await this.requestAccessToken();
    }

    console.log('[Google Drive]  Abriendo selector de carpeta...');

    return new Promise((resolve, reject) => {
      try {
        const picker = new google.picker.PickerBuilder()
          .addView(new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true))
          .setOAuthToken(this.accessToken!)
          .setDeveloperKey(this.config.apiKey)
          .setAppId(this.config.appId)
          .setCallback((data: any) => {
            if (data.action === google.picker.Action.PICKED) {
              console.log('[Google Drive]  Carpeta seleccionada:', data.docs[0].name);
              resolve(data.docs[0].id);
            } else if (data.action === google.picker.Action.CANCEL) {
              console.log('[Google Drive]  Selección cancelada');
              resolve(null);
            }
          })
          .build();

        picker.setVisible(true);
      } catch (error) {
        console.error('[Google Drive]  Error abriendo picker:', error);
        reject(error);
      }
    });
  }

  async uploadFile(blob: Blob, fileName: string, mimeType: string, folderId?: string): Promise<any> {
    await this.ensureInitialized();

    if (!this.accessToken) {
      await this.requestAccessToken();
    }

    console.log(`[Google Drive]  Subiendo archivo: ${fileName}`);

    const metadata = {
      name: fileName,
      mimeType,
      ...(folderId && { parents: [folderId] })
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { 
      type: 'application/json' 
    }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.accessToken}` 
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Google Drive]  Error subiendo archivo:', errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[Google Drive]  Archivo subido exitosamente:', result.name);
    return result;
  }

  async exportToGoogleDrive(
    data: any[], 
    fileName: string, 
    headers: string[]
  ): Promise<{ fileId: string; fileName: string; fileUrl: string }> {
    if (!this.isBrowser) {
      throw new Error('Solo disponible en navegador');
    }

    await this.ensureInitialized();

    if (!this.XLSX) {
      console.error('[Google Drive]  XLSX no está disponible después de ensureInitialized');
      throw new Error('Librería XLSX no está disponible. Intenta recargar la página.');
    }

    console.log(`[Google Drive]  Creando archivo Excel con ${data.length} registros...`);

    const wb = { SheetNames: [] as string[], Sheets: {} as any };
    const wsData = [
      headers,
      ...data.map((row: any) => headers.map((h: string) => row[h.toLowerCase().replace(/ /g, '_')] || ''))
    ];
    
    const ws = this.XLSX.utils.aoa_to_sheet(wsData);
    
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    wb.SheetNames.push('Datos');
    wb.Sheets['Datos'] = ws;

    const wbout = this.XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    const blob = new Blob([buf], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    const folderId = await this.openFolderPicker();
    if (!folderId) {
      throw new Error('No se seleccionó ninguna carpeta');
    }

    const file = await this.uploadFile(
      blob, 
      `${fileName}.xlsx`, 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      folderId
    );

    return {
      fileId: file.id,
      fileName: file.name,
      fileUrl: `https://drive.google.com/file/d/${file.id}/view`
    };
  }

  async exportToExcel(
    data: any[], 
    fileName: string, 
    headers: string[]
  ): Promise<void> {
    if (!this.isBrowser) {
      throw new Error('Solo disponible en navegador');
    }

    await this.ensureInitialized();

    if (!this.XLSX) {
      throw new Error('Librería XLSX no está disponible');
    }

    console.log(`[Google Drive]  Creando archivo Excel local con ${data.length} registros...`);

    const wb = { SheetNames: [] as string[], Sheets: {} as any };
    const wsData = [
      headers,
      ...data.map((row: any) => headers.map((h: string) => row[h.toLowerCase().replace(/ /g, '_')] || ''))
    ];
    
    const ws = this.XLSX.utils.aoa_to_sheet(wsData);
    
    const colWidths = headers.map((h: string) => ({ wch: Math.max(h.length + 2, 15) }));
    ws['!cols'] = colWidths;
    
    wb.SheetNames.push('Datos');
    wb.Sheets['Datos'] = ws;

    const wbout = this.XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    const blob = new Blob([buf], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('[Google Drive]  Archivo descargado:', `${fileName}.xlsx`);
  }

  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.apiKey);
  }

  isXLSXLoaded(): boolean {
    return this.xlsxLoaded && this.XLSX !== null;
  }

  disconnect(): void {
    if (this.isBrowser && this.accessToken) {
      try {
        google.accounts.oauth2.revoke(this.accessToken);
        this.accessToken = null;
        console.log('[Google Drive]  Sesión cerrada');
      } catch (error) {
        console.error('[Google Drive]  Error al revocar token:', error);
      }
    }
  }
}