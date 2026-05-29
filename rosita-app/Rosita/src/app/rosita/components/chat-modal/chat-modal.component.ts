// src/app/rosita/components/chat-modal/chat-modal.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatDetail, ChatMessage } from '../../../services/chat.service';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss']
})
export class ChatModalComponent {
  @Input() visible: boolean = false;
  @Input() chat: ChatDetail | null = null;
  @Input() replyText: string = '';
  @Input() sendingMessage: boolean = false;
  @Output() close = new EventEmitter<void>();


  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}