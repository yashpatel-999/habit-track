import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Habit Tracker';
  constructor(private router: Router) {}
  isAuthRoute(): boolean {
    const route = this.router.url.split('?')[0].split('#')[0];
    return route.startsWith('/login') || route.startsWith('/signup');
  }
}
