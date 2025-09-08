import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, HabitCreateRequest, HabitUpdateRequest, HabitLog, HabitProgress } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly API_URL = 'http://127.0.0.1:8080';

  constructor(private http: HttpClient) {}

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.API_URL}/habits`);
  }

  createHabit(habit: HabitCreateRequest): Observable<Habit> {
    return this.http.post<Habit>(`${this.API_URL}/habits`, habit);
  }

  updateHabit(id: string, habit: HabitUpdateRequest): Observable<Habit> {
    return this.http.put<Habit>(`${this.API_URL}/habits/${id}`, habit);
  }

  deleteHabit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/habits/${id}`);
  }

  logHabitCompletion(id: string): Observable<HabitLog> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const logData = {
      date: today,
      status: true
    };
    return this.http.post<HabitLog>(`${this.API_URL}/habits/${id}/log`, logData);
  }

  getHabitProgress(id: string): Observable<HabitProgress> {
    return this.http.get<HabitProgress>(`${this.API_URL}/habits/${id}/progress`);
  }
}
