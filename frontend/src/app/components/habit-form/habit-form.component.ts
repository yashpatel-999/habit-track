import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Habit } from '../../models/habit.model';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habit-form.component.html',
  styleUrl: './habit-form.component.css'
})
export class HabitFormComponent implements OnInit {
  habitForm: FormGroup;
  isEditMode = false;
  habitId: string | null = null;
  isLoading = false;
  errorMessage = '';
  pageTitle = 'Create New Habit';

  constructor(
    private fb: FormBuilder,
    private habitService: HabitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.habitForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      frequency: ['daily', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.habitId = this.route.snapshot.paramMap.get('id');
    
    if (this.habitId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Habit';
      this.loadHabit();
    }
  }

  loadHabit(): void {
    if (!this.habitId) return;

    // In a real app, you'd have a getHabit(id) method
    // For now, we'll get all habits and find the one we need
    this.habitService.getHabits().subscribe({
      next: (habits: Habit[]) => {
        const habit = habits.find(h => h.id === this.habitId);
        if (habit) {
          this.habitForm.patchValue({
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency
          });
        } else {
          this.errorMessage = 'Habit not found';
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load habit. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.habitForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const habitData = this.habitForm.value;

      if (this.isEditMode && this.habitId) {
        this.habitService.updateHabit(this.habitId, habitData).subscribe({
          next: (habit: Habit) => {
            this.isLoading = false;
            this.router.navigate(['/habits']);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.errorMessage = error.error?.message || 'Failed to update habit. Please try again.';
          }
        });
      } else {
        this.habitService.createHabit(habitData).subscribe({
          next: (habit: Habit) => {
            this.isLoading = false;
            this.router.navigate(['/habits']);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.errorMessage = error.error?.message || 'Failed to create habit. Please try again.';
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/habits']);
  }

  get title() {
    return this.habitForm.get('title');
  }

  get description() {
    return this.habitForm.get('description');
  }

  get frequency() {
    return this.habitForm.get('frequency');
  }
}
