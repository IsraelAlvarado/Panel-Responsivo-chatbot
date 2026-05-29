import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FaqBotpressService, Faq } from '../../services/faq-botpress.service';

@Injectable({
  providedIn: 'root'
})
export class FaqFacade {
  private _faqs = new BehaviorSubject<Faq[]>([]);
  private _selectedFaq = new BehaviorSubject<Partial<Faq> | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);
  private _showModal = new BehaviorSubject<boolean>(false);

  // Getters sincronos
  get faqs(): Faq[] {
    return this._faqs.getValue();
  }

  get selectedFaq(): Partial<Faq> | null {
    return this._selectedFaq.getValue();
  }

  get loading(): boolean {
    return this._loading.getValue();
  }

  get showModal(): boolean {
    return this._showModal.getValue();
  }

  constructor(private faqService: FaqBotpressService) {}

  initialize(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this._loading.next(true);

    this.faqService.getAll().subscribe({
      next: (data: Faq[]) => {
        this._faqs.next(data);
        this._loading.next(false);
      },
      error: (err: any) => {
        console.error('Error al cargar FAQs:', err);
        this._loading.next(false);
        alert('Error al cargar FAQs. Verifica tu conexion con el servidor.');
      }
    });
  }

  createFaq(): void {
    this._selectedFaq.next({
      pregunta: '',
      respuesta: '',
      categoria: '',
      orden: 0,
      activo: true
    });
  }

  editFaq(faq: Faq): void {
    this._selectedFaq.next({ ...faq });
  }

  saveFaq(): void {
    const faq = this.selectedFaq;
    if (!faq) return;

    this._loading.next(true);

    const req$ = faq.id_faq
      ? this.faqService.update(faq.id_faq, faq)
      : this.faqService.create(faq);

    req$.subscribe({
      next: (result: Faq) => {
        this._selectedFaq.next(null);
        this.loadFaqs();
        alert('FAQ guardada exitosamente');
      },
      error: (err: any) => {
        console.error('Error guardando FAQ:', err);
        this._loading.next(false);
        alert('Error al guardar FAQ');
      }
    });
  }

  deleteFaq(id: number | undefined): void {
    if (!id) {
      alert('ID de FAQ no valido');
      return;
    }

    if (!confirm('Eliminar esta pregunta frecuente?')) return;

    this._loading.next(true);

    this.faqService.delete(id).subscribe({
      next: () => {
        this.loadFaqs();
        alert('FAQ eliminada exitosamente');
      },
      error: (err: any) => {
        console.error('Error eliminando FAQ:', err);
        this._loading.next(false);
        alert('Error al eliminar FAQ');
      }
    });
  }

  openModal(): void {
    this._showModal.next(true);
    this.loadFaqs();
  }

  closeModal(): void {
    this._showModal.next(false);
    this._selectedFaq.next(null);
  }

  closeForm(): void {
    this._selectedFaq.next(null);
  }
}