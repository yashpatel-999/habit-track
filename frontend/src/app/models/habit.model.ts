export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string;
  frequency: string;
}

export interface HabitCreateRequest {
  title: string;
  description: string;
  frequency: string;
}

export interface HabitUpdateRequest {
  title?: string;
  description?: string;
  frequency?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
}

export interface HabitProgress {
  habit_id: string;
  completion_percentage: number;
  total_days: number;
  completed_days: number;
}
