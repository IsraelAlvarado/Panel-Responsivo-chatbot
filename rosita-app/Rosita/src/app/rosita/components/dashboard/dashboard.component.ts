import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncInfo } from '../../../services/dashboard.service';

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  activeUsers: number;
}

export interface WeeklyActivityData {
  day: string;
  total: number;
  completed: number;
  pending: number;
  active: number;
}

export interface TopConsultation {
  t: string;
  c: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @Input() stats: DashboardStats = { total: 0, completed: 0, pending: 0, activeUsers: 0 };
  @Input() weeklyActivity: WeeklyActivityData[] = [];
  @Input() topConsultations: TopConsultation[] = [];
  @Input() analyzingConsultations: boolean = false;
  @Input() analysisProgress: string = '';
  @Input() lastSync: SyncInfo | null = null;
  @Output() exportData = new EventEmitter<'json' | 'xlsx'>();

  Math = Math;

  getResolutionPercent(): string {
    const { total, completed } = this.stats;
    return total ? ((completed / total) * 100).toFixed(1) : '0';
  }

  getWeeklyTotal(): number {
    return this.weeklyActivity.reduce((acc, day) => acc + day.total, 0);
  }

  getWeeklyCompleted(): number {
    return this.weeklyActivity.reduce((acc, day) => acc + day.completed, 0);
  }

  getWeeklyPending(): number {
    return this.weeklyActivity.reduce((acc, day) => acc + day.pending, 0);
  }

  getWeeklyActive(): number {
    return this.weeklyActivity.reduce((acc, day) => acc + day.active, 0);
  }

  onExportClick(format: 'json' | 'xlsx'): void {
    this.exportData.emit(format);
  }
}