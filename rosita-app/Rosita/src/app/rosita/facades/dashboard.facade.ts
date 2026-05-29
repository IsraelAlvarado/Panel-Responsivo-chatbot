import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardService, DashboardStats, SyncInfo } from '../../services/dashboard.service';
import { ChatListItem, ChatDetail } from '../../services/chat.service';

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

export interface DashboardStatsView {
  total: number;
  completed: number;
  pending: number;
  activeUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFacade {
  private _stats = new BehaviorSubject<DashboardStatsView>({
    total: 0,
    completed: 0,
    pending: 0,
    activeUsers: 0
  });
  private _weeklyActivity = new BehaviorSubject<WeeklyActivityData[]>([]);
  private _topConsultations = new BehaviorSubject<TopConsultation[]>([]);
  private _analyzingConsultations = new BehaviorSubject<boolean>(false);
  private _analysisProgress = new BehaviorSubject<string>('');
  private _lastSync = new BehaviorSubject<SyncInfo | null>(null);

  stats$ = this._stats.asObservable();
  weeklyActivity$ = this._weeklyActivity.asObservable();
  topConsultations$ = this._topConsultations.asObservable();
  analyzingConsultations$ = this._analyzingConsultations.asObservable();
  analysisProgress$ = this._analysisProgress.asObservable();
  lastSync$ = this._lastSync.asObservable();

  get stats(): DashboardStatsView {
    return this._stats.getValue();
  }

  get weeklyActivity(): WeeklyActivityData[] {
    return this._weeklyActivity.getValue();
  }

  get topConsultations(): TopConsultation[] {
    return this._topConsultations.getValue();
  }

  get analyzingConsultations(): boolean {
    return this._analyzingConsultations.getValue();
  }

  get analysisProgress(): string {
    return this._analysisProgress.getValue();
  }

  get lastSync(): SyncInfo | null {
    return this._lastSync.getValue();
  }

  private readonly stopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
    'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'más', 'pero',
    'sus', 'le', 'ya', 'o', 'este', 'si', 'sí', 'porque', 'esta', 'entre', 'cuando',
    'muy', 'sin', 'sobre', 'tambien', 'también', 'me', 'mi', 'te', 'tu', 'es', 'son',
    'conversacion', 'conversación', 'titulo', 'título', 'mensajes', 'hola', 'servicios', 'gracias'
  ]);

  constructor(private dashboardService: DashboardService) {}

  loadStats(): void {
    this._analyzingConsultations.next(true);
    this._analysisProgress.next('Sincronizando con Botpress...');

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          
          this._stats.next({
            total: data.total,
            completed: data.completed,
            pending: data.pending,
            activeUsers: data.activeUsers
          });

          this._weeklyActivity.next(data.weeklyActivity || []);
          this._topConsultations.next(data.topConsultations || []);
          this._lastSync.next(response.sync);
        }
        this._analyzingConsultations.next(false);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this._analyzingConsultations.next(false);
      }
    });
  }

  updateStats(chatList: ChatListItem[]): void {
    const completed = chatList.filter((c: ChatListItem) => c.status === 'completed').length;
    const pending = chatList.filter((c: ChatListItem) => c.status === 'pending').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activeUsersWithDates = chatList.filter((c: ChatListItem) => {
      const dateStr = c.lastActivity || c.date;
      if (!dateStr) return false;
      const activityDate = this.parseFlexibleDate(dateStr);
      if (!activityDate) return false;
      return activityDate >= sevenDaysAgo;
    });

    const uniqueUsers = new Set(activeUsersWithDates.map((c: ChatListItem) => c.userEmail)).size;

    this._stats.next({
      total: chatList.length,
      completed,
      pending,
      activeUsers: uniqueUsers
    });
  }

  calculateWeeklyActivity(chatList: ChatListItem[]): void {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDates: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      weekDates.push(date);
    }

    const activityData = weekDates.map((date) => ({
      day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
      date: date,
      total: 0,
      completed: 0,
      pending: 0,
      active: 0
    }));

    chatList.forEach((chat: ChatListItem) => {
      const dateStr = chat.lastActivity || chat.date;
      if (!dateStr) return;

      const chatDate = this.parseFlexibleDate(dateStr);
      if (!chatDate) return;

      chatDate.setHours(0, 0, 0, 0);

      const dayIndex = weekDates.findIndex((weekDate: Date) =>
        weekDate.getTime() === chatDate.getTime()
      );

      if (dayIndex !== -1) {
        activityData[dayIndex].total++;
        if (chat.status === 'completed') {
          activityData[dayIndex].completed++;
        } else if (chat.status === 'pending') {
          activityData[dayIndex].pending++;
        }

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (chatDate >= sevenDaysAgo) {
          activityData[dayIndex].active++;
        }
      }
    });

    const finalData = activityData.map(({ date, ...rest }) => rest);
    this._weeklyActivity.next(finalData);
  }

  analyzeConsultations(
    chatList: ChatListItem[],
    getChatMessages: (chatId: string) => Observable<ChatDetail>
  ): void {
    if (chatList.length === 0) {
      this._topConsultations.next([]);
      return;
    }

    const chatsToAnalyze = chatList.slice(0, 20);
    const counter = new Map<string, number>();
    let processedChats = 0;

    this._analyzingConsultations.next(true);
    this._analysisProgress.next(`Analizando 0 de ${chatsToAnalyze.length} conversaciones...`);

    chatsToAnalyze.forEach((chat: ChatListItem) => {
      getChatMessages(chat.id).subscribe({
        next: (chatDetail: ChatDetail) => {
          chatDetail.messages
            .filter((msg: any) => msg.sender === 'user')
            .forEach((msg: any) => {
              const text = msg.text.toLowerCase();
              text
                .replace(/[^\w\sáéíóúñ]/g, '')
                .split(/\s+/)
                .filter((word: string) => word.length > 3 && !this.stopWords.has(word))
                .forEach((word: string) => {
                  counter.set(word, (counter.get(word) || 0) + 1);
                });
            });

          processedChats++;
          this._analysisProgress.next(`Analizando ${processedChats} de ${chatsToAnalyze.length} conversaciones...`);

          if (processedChats === chatsToAnalyze.length) {
            this.finalizeAnalysis(counter);
          }
        },
        error: (err: any) => {
          console.error(`Error analizando chat ${chat.id}:`, err);
          processedChats++;
          this._analysisProgress.next(`Analizando ${processedChats} de ${chatsToAnalyze.length} conversaciones...`);

          if (processedChats === chatsToAnalyze.length) {
            this.finalizeAnalysis(counter);
          }
        }
      });
    });
  }

  private finalizeAnalysis(counter: Map<string, number>): void {
    const top = Array.from(counter.entries())
      .map(([t, c]) => ({ t, c }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 5);

    this._topConsultations.next(top);
    this._analyzingConsultations.next(false);
  }

  private parseFlexibleDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
      }

      const match1 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2}):(\d{2})/);
      if (match1) {
        const [, day, month, year, hour, minute, second] = match1;
        return new Date(+year, +month - 1, +day, +hour, +minute, +second);
      }

      const match2 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match2) {
        const [, day, month, year] = match2;
        return new Date(+year, +month - 1, +day);
      }

      const match3 = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/i);
      if (match3) {
        const [, day, monthStr, year] = match3;
        const monthMap: { [key: string]: number } = {
          'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };
        const month = monthMap[monthStr.toLowerCase()];
        if (month !== undefined) {
          return new Date(+year, month, +day);
        }
      }

      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}