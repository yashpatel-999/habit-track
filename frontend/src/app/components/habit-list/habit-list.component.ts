import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Habit } from '../../models/habit.model';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.css'
})
export class HabitListComponent implements OnInit {
  habits: Habit[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.isLoading = true;
    this.habitService.getHabits().subscribe({
      next: (habits: Habit[]) => {
        this.habits = habits;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load habits. Please try again.';
        this.isLoading = false;
      }
    });
  }

  deleteHabit(id: string): void {
    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitService.deleteHabit(id).subscribe({
        next: () => {
          this.habits = this.habits.filter(habit => habit.id !== id);
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete habit. Please try again.';
        }
      });
    }
  }

  logCompletion(habitId: string): void {
    this.habitService.logHabitCompletion(habitId).subscribe({
      next: () => {
        // Show success message or update UI
        alert('Habit completion logged successfully!');
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to log habit completion. Please try again.';
      }
    });
  }

  editHabit(id: string): void {
    this.router.navigate(['/habits', id, 'edit']);
  }

  viewProgress(id: string): void {
    this.router.navigate(['/habits', id, 'progress']);
  }

  addNewHabit(): void {
    this.router.navigate(['/habits/new']);
  }
}
