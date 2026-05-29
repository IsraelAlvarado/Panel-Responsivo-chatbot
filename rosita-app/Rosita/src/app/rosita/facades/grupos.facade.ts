import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InscripcionService, GrupoParroquial } from '../../services/inscripcion.service';

@Injectable({
  providedIn: 'root'
})
export class GruposFacade {
  private _grupos = new BehaviorSubject<GrupoParroquial[]>([]);
  private _selectedGrupo = new BehaviorSubject<Partial<GrupoParroquial> | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);

  // Getters sincronos
  get grupos(): GrupoParroquial[] {
    return this._grupos.getValue();
  }

  get selectedGrupo(): Partial<GrupoParroquial> | null {
    return this._selectedGrupo.getValue();
  }

  get loading(): boolean {
    return this._loading.getValue();
  }

  get showModal(): boolean {
    return this._showModal.getValue();
  }

  constructor(private inscripcionService: InscripcionService) {}

  loadGrupos(): void {
    this._loading.next(true);

    this.inscripcionService.getAllGrupos().subscribe({
      next: (data: GrupoParroquial[]) => {
        this._grupos.next(data);
        this._loading.next(false);
      },
      error: (err: any) => {
        this._loading.next(false);
        alert('Error al cargar grupos. Verifica tu conexion con el servidor.');
      }
    });
  }

  createGrupo(): void {
    this._selectedGrupo.next({
      nombre_grupo: '',
      descripcion: '',
      horario_reunion: '',
      requisitos: '',
      total_inscritos: 0,
      pendientes: 0
    });
  }

  editGrupo(grupo: GrupoParroquial): void {
    this._selectedGrupo.next({ ...grupo });
  }

  saveGrupo(): void {
    const grupo = this.selectedGrupo;
    if (!grupo) return;

    this._loading.next(true);

    const req$ = grupo.id_grupo
      ? this.inscripcionService.updateGrupo(grupo.id_grupo, grupo)
      : this.inscripcionService.createGrupo(grupo);

    req$.subscribe({
      next: (result: GrupoParroquial) => {
        this._selectedGrupo.next(null);
        this.loadGrupos();
        alert('Grupo guardado exitosamente');
      },
      error: (err: any) => {
        this._loading.next(false);
      }
    });
  }

  deleteGrupo(id: number, onSuccess?: () => void): void {
    if (!confirm('Eliminar este grupo? Tambien se eliminaran todas sus inscripciones.')) return;

    this._loading.next(true);

    this.inscripcionService.deleteGrupo(id).subscribe({
      next: () => {
        this.loadGrupos();
        if (onSuccess) onSuccess();
        alert('Grupo eliminado exitosamente');
      },
      error: (err: any) => {
        this._loading.next(false);
      }
    });
  }

  openModal(): void {
    this._showModal.next(true);
    this.loadGrupos();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._selectedGrupo.next(null);
  }

  closeForm(): void {
    this._selectedGrupo.next(null);
  }
}