// src/app/rosita/components/grupos-modal/grupos-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoParroquial } from '../../../services/inscripcion.service';

@Component({
  selector: 'app-grupos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos-modal.component.html',
  styleUrls: ['./grupos-modal.component.scss']
})
export class GruposModalComponent {
  @Input() visible = false;
  @Input() grupos: GrupoParroquial[] = [];
  @Input() loading = false;
  @Input() selectedGrupo: Partial<GrupoParroquial> | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() newGrupo = new EventEmitter<void>();
  @Output() editGrupo = new EventEmitter<GrupoParroquial>();
  @Output() deleteGrupo = new EventEmitter<number>();
  @Output() saveGrupo = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() viewInscripciones = new EventEmitter<number>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onFormBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeForm.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onNewGrupo(): void {
    this.newGrupo.emit();
  }

  onEditGrupo(grupo: GrupoParroquial): void {
    this.editGrupo.emit(grupo);
  }

  onDeleteGrupo(id: number): void {
    this.deleteGrupo.emit(id);
  }

  onSaveGrupo(): void {
    this.saveGrupo.emit();
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  onViewInscripciones(id: number): void {
    this.viewInscripciones.emit(id);
  }

  isSaveDisabled(): boolean {
    return !this.selectedGrupo?.nombre_grupo;
  }
}