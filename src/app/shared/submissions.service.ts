// src/app/shared/submissions.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubmissionsService {
  private baseUrl = 'http://localhost:3000/submissions';

  constructor(private http: HttpClient) {}

list(): Observable<any[]> {
  return this.http.get<any[]>(this.baseUrl, {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });
}
  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Use FormData when uploading CV
  create(submission: FormData | any): Observable<any> {
    return this.http.post(this.baseUrl, submission);
  }

  update(id: number, submission: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, submission);
  }
// Add this method to SubmissionsService
delete(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`);
}

}