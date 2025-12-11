// src/app/student/my-applications/my-applications.component.ts
import { Component, OnInit } from '@angular/core';
import { SubmissionsService } from '../../shared/submissions.service';
import { OffersService } from '../../shared/offers.service';
import { AuthService } from '../../users/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html'
})
export class MyApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  constructor(
    private submissionsService: SubmissionsService,
    private offersService: OffersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    const currentUser = this.auth.getUser();
    if (!currentUser) {
      this.loading = false;
      return;
    }

    const userId = Number(currentUser.id); // ← THIS FIXES EVERYTHING

    this.submissionsService.list().subscribe({
      next: (subs: any[]) => {
        const mySubs = subs.filter(s => Number(s.studentId) === userId);

        if (mySubs.length === 0) {
          this.applications = [];
          this.loading = false;
          return;
        }

        const requests = mySubs.map(s => this.offersService.get(Number(s.offerId)));
        forkJoin(requests).subscribe({
          next: (offers) => {
            this.applications = mySubs.map((sub, i) => ({
              ...sub,
              offer: offers[i]
            }));
            this.loading = false;
          },
          error: () => {
            this.applications = [];
            this.loading = false;
          }
        });
      },
      error: () => {
        this.applications = [];
        this.loading = false;
      }
    });
  }
}