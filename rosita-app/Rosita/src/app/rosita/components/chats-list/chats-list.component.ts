// src/app/rosita/components/chats-list/chats-list.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListItem } from '../../../services/chat.service';

@Component({
  selector: 'app-chats-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent {
  @Input() chats: ChatListItem[] = [];
  @Input() loading: boolean = false;
  @Output() chatClick = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<'all' | 'completed' | 'pending'>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() deleteChat = new EventEmitter<string>();

  currentFilter: 'all' | 'completed' | 'pending' = 'all';

  onChatClick(chatId: string): void {
    this.chatClick.emit(chatId);
  }

  onFilterClick(filter: 'all' | 'completed' | 'pending'): void {
    this.currentFilter = filter;
    this.filterChange.emit(filter);
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchChange.emit(query);
  }

  onDeleteClick(event: Event, chatId: string): void {
    event.stopPropagation();
    this.deleteChat.emit(chatId);
  }

  getUserInitial(userName: string): string {
    return userName?.charAt(0).toUpperCase() || '?';
  }

  isFilterActive(filter: 'all' | 'completed' | 'pending'): boolean {
    return this.currentFilter === filter;
  }
}