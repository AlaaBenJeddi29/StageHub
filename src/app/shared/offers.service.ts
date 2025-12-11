// src/app/shared/offers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OffersService {
  private baseUrl = 'http://localhost:3000/offers';

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(offer: any): Observable<any> {
    return this.http.post(this.baseUrl, offer);
  }

  update(id: number, offer: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, offer);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}