import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://127.0.0.1:8080';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // You might want to validate the token or get user info
      // For now, we'll just assume it's valid
      this.setLoggedIn();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          // Create a minimal user object since backend only returns user_id
          this.currentUserSubject.next({
            id: response.user_id,
            username: credentials.username,
            email: ''
          });
        })
      );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          // Create a minimal user object since backend only returns user_id
          this.currentUserSubject.next({
            id: response.user_id,
            username: userData.username,
            email: userData.email
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setLoggedIn(): void {
    // This is a simplified version - in a real app you might decode the JWT
    // or make an API call to get current user info
    this.currentUserSubject.next({
      id: '',
      username: '',
      email: ''
    });
  }
}
