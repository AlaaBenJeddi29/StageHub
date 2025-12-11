// src/app/users/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  create(user: any): Observable<any> {
    return this.http.post(this.baseUrl, user);
  }

  // PUT for full update (profile + image)
  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, user);
  }

  get(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}