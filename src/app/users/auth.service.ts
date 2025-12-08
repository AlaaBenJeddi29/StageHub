import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/users?email=${email}`).pipe(
      tap(users => {
        if (users && users.length && users[0].password === password) {
          localStorage.setItem('user', JSON.stringify(users[0]));
          return users[0];
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(err => throwError(() => new Error('Login failed: ' + err.message)))
    );
  }

  logout() {
    localStorage.removeItem('user');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isAuthenticated() {
    return !!this.getUser();
  }

  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
}