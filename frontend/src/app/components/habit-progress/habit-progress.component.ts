import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { HabitProgress, Habit } from '../../models/habit.model';

@Component({
  selector: 'app-habit-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-progress.component.html',
  styleUrl: './habit-progress.component.css'
})
export class HabitProgressComponent implements OnInit {
  habitId: string | null = null;
  habit: Habit | null = null;
  progress: HabitProgress | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.habitId = this.route.snapshot.paramMap.get('id');
    
    if (this.habitId) {
      this.loadHabitAndProgress();
    } else {
      this.errorMessage = 'Invalid habit ID';
      this.isLoading = false;
    }
  }

  loadHabitAndProgress(): void {
    if (!this.habitId) return;

    // Load habit details and progress
    Promise.all([
      this.loadHabit(),
      this.loadProgress()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadHabit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.habitService.getHabits().subscribe({
        next: (habits: Habit[]) => {
          this.habit = habits.find(h => h.id === this.habitId) || null;
          if (!this.habit) {
            this.errorMessage = 'Habit not found';
          }
          resolve();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to load habit details';
          reject(error);
        }
      });
    });
  }

  private loadProgress(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.habitId) {
        reject('No habit ID');
        return;
      }

      this.habitService.getHabitProgress(this.habitId).subscribe({
        next: (progress: HabitProgress) => {
          this.progress = progress;
          resolve();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to load progress data';
          reject(error);
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/habits']);
  }

  logCompletion(): void {
    if (!this.habitId) return;

    this.habitService.logHabitCompletion(this.habitId).subscribe({
      next: () => {
        // Reload progress data
        this.loadProgress();
        alert('Habit completion logged successfully!');
      },
      error: (error: any) => {
        alert('Failed to log habit completion. Please try again.');
      }
    });
  }

  editHabit(): void {
    if (this.habitId) {
      this.router.navigate(['/habits', this.habitId, 'edit']);
    }
  }
}
