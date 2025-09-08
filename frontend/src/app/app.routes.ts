import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  { 
    path: 'habits', 
    loadComponent: () => import('./components/habit-list/habit-list.component').then(m => m.HabitListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'habits/new', 
    loadComponent: () => import('./components/habit-form/habit-form.component').then(m => m.HabitFormComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'habits/:id/edit', 
    loadComponent: () => import('./components/habit-form/habit-form.component').then(m => m.HabitFormComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'habits/:id/progress', 
    loadComponent: () => import('./components/habit-progress/habit-progress.component').then(m => m.HabitProgressComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
