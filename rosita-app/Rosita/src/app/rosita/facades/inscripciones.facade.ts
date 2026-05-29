// src/app/rosita/facades/inscripciones.facade.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { InscripcionService, Inscripcion } from '../../services/inscripcion.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { firstValueFrom } from 'rxjs';

export interface EstadisticasInscripciones {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionesFacade {
  private isBrowser: boolean;

  private _inscripciones = new BehaviorSubject<Inscripcion[]>([]);
  private _filteredInscripciones = new BehaviorSubject<Inscripcion[]>([]);
  private _selectedInscripcion = new BehaviorSubject<any>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);
  private _grupoSeleccionadoId = new BehaviorSubject<number | null>(null);
  private _tipoServicioSeleccionado = new BehaviorSubject<string | null>(null);
  
  private _estadisticas = new BehaviorSubject<EstadisticasInscripciones>({
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    completadas: 0
  });

  // Getters sincronos
  get inscripciones(): Inscripcion[] {
    return this._inscripciones.getValue();
  }

  get filteredInscripciones(): Inscripcion[] {
    return this._filteredInscripciones.getValue();
  }

  get selectedInscripcion(): any {
    return this._selectedInscripcion.getValue();
  }

  get loading(): boolean {
    return this._loading.getValue();
  }

  get showModal(): boolean {
    return this._showModal.getValue();
  }

  get grupoSeleccionadoId(): number | null {
    return this._grupoSeleccionadoId.getValue();
  }

  get tipoServicioSeleccionado(): string | null {
    return this._tipoServicioSeleccionado.getValue();
  }

  get estadisticas(): EstadisticasInscripciones {
    return this._estadisticas.getValue();
  }

  constructor(
    private inscripcionService: InscripcionService,
    private googleDriveService: GoogleDriveService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  loadInscripciones(): void {
    this._loading.next(true);
    this.inscripcionService.getAllInscripciones().subscribe({
      next: (data: Inscripcion[]) => {
        this._inscripciones.next(data);
        this._filteredInscripciones.next(data);
        this._loading.next(false);
      },
      error: (err: any) => {
        this._loading.next(false);
        alert('Error al cargar inscripciones.');
      }
    });
  }

  loadInscripcionesByGrupo(grupoId: number): void {
    this._loading.next(true);
    this._grupoSeleccionadoId.next(grupoId);
    this._tipoServicioSeleccionado.next(null);
    this.inscripcionService.getInscripcionesByGrupo(grupoId).subscribe({
      next: (data: Inscripcion[]) => {
        this._inscripciones.next(data);
        this._filteredInscripciones.next(data);
        this._loading.next(false);
      },
      error: (err: any) => {
        this._loading.next(false);
      }
    });
  }

  loadInscripcionesByTipo(tipo: string): void {
    this._loading.next(true);
    this._tipoServicioSeleccionado.next(tipo);
    this._grupoSeleccionadoId.next(null);
    this.inscripcionService.getInscripcionesByTipo(tipo).subscribe({
      next: (data: Inscripcion[]) => {
        this._inscripciones.next(data);
        this._filteredInscripciones.next(data);
        this._loading.next(false);
      },
      error: (err: any) => {
        this._loading.next(false);
      }
    });
  }

  loadEstadisticas(): void {
    this.inscripcionService.getEstadisticas().subscribe({
      next: (stats) => {
        this._estadisticas.next(stats);
      },
      error: (err) => {}
    });
  }

  createInscripcion(inscripcion: Partial<Inscripcion> = {}): void {
    const newInscripcion: any = {
      feligres_nombres: '',
      feligres_apellidos: '',
      feligres_cedula: '',
      feligres_correo: '',
      feligres_fecha_nacimiento: '',
      feligres_ciudad_nacimiento: '',
      feligres_localidad_nacimiento: '',
      feligres_domicilio: '',
      feligres_sexo: '',
      feligres_nacionalidad: '',
      tipo_servicio: this.tipoServicioSeleccionado || 'grupo_parroquial',
      grupo_id: this.grupoSeleccionadoId || undefined,
      datos_adicionales: '',
      estado: 'pendiente',
      ...inscripcion
    };
    this._selectedInscripcion.next(newInscripcion);
  }

  async viewInscripcion(inscripcion: Inscripcion): Promise<void> {
    this._loading.next(true);
    try {
      const inscripcionCompleta = await firstValueFrom(
        this.inscripcionService.getInscripcionById(inscripcion.id_inscripcion!)
      );
      if (inscripcionCompleta && inscripcionCompleta.feligres_id) {
        const feligres = await firstValueFrom(
          this.inscripcionService.getFeligresById(inscripcionCompleta.feligres_id)
        );
        
        let fechaNacimiento = feligres?.fecha_nacimiento || inscripcionCompleta.feligres_fecha_nacimiento || '';
        if (fechaNacimiento && typeof fechaNacimiento === 'string') {
          fechaNacimiento = fechaNacimiento.split('T')[0];
        }
        
        let datosAdicionales = '';
        const rawDatos = inscripcionCompleta.datos_adicionales;
        if (rawDatos) {
          if (typeof rawDatos === 'object') {
            if (rawDatos.valor && Object.keys(rawDatos).length === 1) {
              datosAdicionales = rawDatos.valor;
            } else {
              datosAdicionales = JSON.stringify(rawDatos);
            }
          } else {
            datosAdicionales = String(rawDatos);
          }
        }
        
        this._selectedInscripcion.next({
          ...inscripcionCompleta,
          feligres_nombres: feligres?.nombres || inscripcionCompleta.feligres_nombres || '',
          feligres_apellidos: feligres?.apellidos || inscripcionCompleta.feligres_apellidos || '',
          feligres_cedula: feligres?.cedula || inscripcionCompleta.feligres_cedula || '',
          feligres_correo: feligres?.correo || inscripcionCompleta.feligres_correo || '',
          feligres_fecha_nacimiento: fechaNacimiento,
          feligres_ciudad_nacimiento: feligres?.ciudad_nacimiento || inscripcionCompleta.feligres_ciudad_nacimiento || '',
          feligres_localidad_nacimiento: feligres?.localidad_nacimiento || inscripcionCompleta.feligres_localidad_nacimiento || '',
          feligres_domicilio: feligres?.domicilio || inscripcionCompleta.feligres_domicilio || '',
          feligres_sexo: feligres?.sexo || inscripcionCompleta.feligres_sexo || '',
          feligres_nacionalidad: feligres?.nacionalidad || inscripcionCompleta.feligres_nacionalidad || '',
          datos_adicionales: datosAdicionales
        });
      } else {
        this._selectedInscripcion.next({ ...inscripcion });
      }
      this._loading.next(false);
    } catch (error) {
      this._loading.next(false);
      this._selectedInscripcion.next({ ...inscripcion });
    }
  }

  async editInscripcion(inscripcion: Inscripcion): Promise<void> {
    await this.viewInscripcion(inscripcion);
  }

  async saveInscripcion(): Promise<void> {
    const inscripcion = this.selectedInscripcion;
    if (!inscripcion) return;

    if (!inscripcion.feligres_nombres || !inscripcion.feligres_apellidos) {
      alert('Nombres y apellidos son requeridos');
      return;
    }

    const isUpdate = !!inscripcion.id_inscripcion;
    const excludeId = isUpdate ? inscripcion.id_inscripcion : undefined;

    this._loading.next(true);

    try {
      const feligresData: any = {
        cedula: inscripcion.feligres_cedula || '',
        nombres: inscripcion.feligres_nombres,
        apellidos: inscripcion.feligres_apellidos,
        fecha_nacimiento: inscripcion.feligres_fecha_nacimiento || null,
        ciudad_nacimiento: inscripcion.feligres_ciudad_nacimiento || null,
        localidad_nacimiento: inscripcion.feligres_localidad_nacimiento || null,
        domicilio: inscripcion.feligres_domicilio || null,
        correo: inscripcion.feligres_correo || null,
        sexo: inscripcion.feligres_sexo || null,
        nacionalidad: inscripcion.feligres_nacionalidad || null
      };

      let feligresId = inscripcion.feligres_id;

      if (!feligresId) {
        if (inscripcion.feligres_cedula) {
          const existingFeligres = await firstValueFrom(
            this.inscripcionService.getFeligresByCedula(inscripcion.feligres_cedula)
          );
          if (existingFeligres) {
            feligresId = existingFeligres.id;
            await firstValueFrom(this.inscripcionService.updateFeligres(feligresId!, feligresData));
          } else {
            const newFeligres = await firstValueFrom(this.inscripcionService.createFeligres(feligresData));
            feligresId = newFeligres.id;
          }
        } else {
          const searchResults = await firstValueFrom(
            this.inscripcionService.searchFeligreses(`${inscripcion.feligres_nombres} ${inscripcion.feligres_apellidos}`)
          );
          const existingByName = searchResults.find((f: any) => 
            f.nombres.toLowerCase() === inscripcion.feligres_nombres.toLowerCase() &&
            f.apellidos.toLowerCase() === inscripcion.feligres_apellidos.toLowerCase()
          );
          if (existingByName) {
            feligresId = existingByName.id;
            await firstValueFrom(this.inscripcionService.updateFeligres(feligresId!, feligresData));
          } else {
            const newFeligres = await firstValueFrom(this.inscripcionService.createFeligres(feligresData));
            feligresId = newFeligres.id;
          }
        }
      } else {
        await firstValueFrom(this.inscripcionService.updateFeligres(feligresId, feligresData));
      }

      const isDuplicate = await firstValueFrom(
        this.inscripcionService.checkDuplicateInscripcion(feligresId!, inscripcion.tipo_servicio, excludeId)
      );

      if (isDuplicate) {
        this._loading.next(false);
        alert('Ya existe una inscripcion activa para este feligres con el mismo tipo de servicio.');
        return;
      }

      let datosAdicionalesParsed = null;
      const datosAdicionalesStr = inscripcion.datos_adicionales;
      if (datosAdicionalesStr && datosAdicionalesStr.trim() !== '') {
        datosAdicionalesParsed = { valor: datosAdicionalesStr.trim() };
      }

      const inscripcionData: any = {
        feligres_id: feligresId,
        tipo_servicio: inscripcion.tipo_servicio,
        grupo_id: inscripcion.grupo_id || null,
        datos_adicionales: datosAdicionalesParsed,
        estado: inscripcion.estado || 'pendiente'
      };

      const req$ = isUpdate
        ? this.inscripcionService.updateInscripcion(inscripcion.id_inscripcion, inscripcionData)
        : this.inscripcionService.createInscripcion(inscripcionData);

      req$.subscribe({
        next: (result) => {
          this._selectedInscripcion.next(null);
          this.reloadCurrentView();
          this.loadEstadisticas();
          this._loading.next(false);
          alert(isUpdate ? 'Inscripcion actualizada exitosamente' : 'Inscripcion creada exitosamente');
        },
        error: (err) => {
          this._loading.next(false);
          alert('Error al guardar la inscripcion. Por favor intenta nuevamente.');
        }
      });
    } catch (error) {
      this._loading.next(false);
      alert('Error al procesar los datos del feligres.');
    }
  }

  updateEstado(inscripcionId: number, nuevoEstado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'): void {
    this._loading.next(true);
    this.inscripcionService.updateInscripcion(inscripcionId, { estado: nuevoEstado }).subscribe({
      next: (result) => {
        this.reloadCurrentView();
        this.loadEstadisticas();
        this._loading.next(false);
      },
      error: (err) => {
        this._loading.next(false);
      }
    });
  }

  deleteInscripcion(id: number): void {
    if (!confirm('Eliminar esta inscripcion?')) return;
    this._loading.next(true);
    this.inscripcionService.deleteInscripcion(id).subscribe({
      next: () => {
        this.reloadCurrentView();
        this.loadEstadisticas();
        this._loading.next(false);
        alert('Inscripcion eliminada exitosamente');
      },
      error: (err: any) => {
        this._loading.next(false);
      }
    });
  }

  filterByEstado(estado: string): void {
    if (estado === 'all') {
      this._filteredInscripciones.next(this.inscripciones);
    } else {
      this._filteredInscripciones.next(
        this.inscripciones.filter((i: Inscripcion) => i.estado === estado)
      );
    }
  }

  searchInscripciones(query: string): void {
    if (!query) {
      this._filteredInscripciones.next(this.inscripciones);
      return;
    }
    const lowerQuery = query.toLowerCase();
    this._filteredInscripciones.next(
      this.inscripciones.filter((inscripcion: Inscripcion) => {
        const nombreCompleto = `${inscripcion.feligres_nombres || ''} ${inscripcion.feligres_apellidos || ''}`.toLowerCase();
        return nombreCompleto.includes(lowerQuery) ||
          (inscripcion.feligres_correo?.toLowerCase().includes(lowerQuery) || false) ||
          (inscripcion.feligres_cedula?.toLowerCase().includes(lowerQuery) || false) ||
          (inscripcion.nombre_grupo?.toLowerCase().includes(lowerQuery) || false);
      })
    );
  }

  async exportInscripciones(formato: 'json' | 'xlsx'): Promise<void> {
    if (!this.isBrowser) return;
    const data = this.filteredInscripciones;

    if (formato === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      this.downloadFile(blob, `inscripciones-${Date.now()}.json`);
    } else {
      try {
        const headers = ['ID', 'Nombres', 'Apellidos', 'Cedula', 'Email', 'Tipo Servicio', 'Grupo', 'Estado', 'Fecha'];
        const rows = data.map((i: Inscripcion) => ({
          id: i.id_inscripcion?.toString() || '',
          nombres: i.feligres_nombres || '',
          apellidos: i.feligres_apellidos || '',
          cedula: i.feligres_cedula || '',
          email: i.feligres_correo || '',
          tipo_servicio: this.inscripcionService.getTipoServicioTexto(i.tipo_servicio),
          grupo: i.nombre_grupo || 'N/A',
          estado: this.inscripcionService.getEstadoTexto(i.estado),
          fecha: new Date(i.fecha_inscripcion || '').toLocaleDateString('es-ES')
        }));
        const result = await this.googleDriveService.exportToGoogleDrive(
          rows,
          `inscripciones-${new Date().toISOString().split('T')[0]}`,
          headers
        );
        alert(`Archivo guardado en Google Drive:\n${result.fileName}\n\n${result.fileUrl}`);
        window.open(result.fileUrl, '_blank');
      } catch (error) {
        alert('Error al exportar a Google Drive. Verifica que hayas dado los permisos necesarios.');
      }
    }
  }

  private downloadFile(blob: Blob, filename: string): void {
    if (!this.isBrowser) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  openModal(grupoId: number | null = null): void {
    this._showModal.next(true);
    this._grupoSeleccionadoId.next(grupoId);
    this._tipoServicioSeleccionado.next(null);
    if (grupoId) {
      this.loadInscripcionesByGrupo(grupoId);
    } else {
      this.loadInscripciones();
    }
    this.loadEstadisticas();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._selectedInscripcion.next(null);
    this._grupoSeleccionadoId.next(null);
    this._tipoServicioSeleccionado.next(null);
  }

  closeForm(): void {
    this._selectedInscripcion.next(null);
  }

  private reloadCurrentView(): void {
    const grupoId = this.grupoSeleccionadoId;
    const tipo = this.tipoServicioSeleccionado;
    if (grupoId) {
      this.loadInscripcionesByGrupo(grupoId);
    } else if (tipo) {
      this.loadInscripcionesByTipo(tipo);
    } else {
      this.loadInscripciones();
    }
  }
}