// src/app/rosita/components/navigation/navigation.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'dashboard' | 'chats' | 'config';

@Component({
  selector: 'app-rosita-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  @Input() currentTab: TabType = 'dashboard';
  @Output() tabChange = new EventEmitter<TabType>();

  changeTab(tab: TabType): void {
    this.tabChange.emit(tab);
  }
}