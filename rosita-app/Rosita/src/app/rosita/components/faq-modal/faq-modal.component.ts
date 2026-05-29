// src/app/rosita/components/faq-modal/faq-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Faq } from '../../../services/faq-botpress.service';

@Component({
  selector: 'app-faq-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq-modal.component.html',
  styleUrls: ['./faq-modal.component.scss']
})
export class FaqModalComponent {
  @Input() visible = false;
  @Input() faqs: Faq[] = [];
  @Input() loading = false;
  @Input() selectedFaq: Partial<Faq> | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() newFaq = new EventEmitter<void>();
  @Output() editFaq = new EventEmitter<Faq>();
  @Output() deleteFaq = new EventEmitter<number>();
  @Output() saveFaq = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();

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

  onNewFaq(): void {
    this.newFaq.emit();
  }

  onEditFaq(faq: Faq): void {
    this.editFaq.emit(faq);
  }

  onDeleteFaq(id: number): void {
    this.deleteFaq.emit(id);
  }

  onSaveFaq(): void {
    this.saveFaq.emit();
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  isSaveDisabled(): boolean {
    return !this.selectedFaq?.pregunta || !this.selectedFaq?.categoria;
  }
}