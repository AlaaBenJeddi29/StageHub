// src/app/company/applications/applications.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionsService } from '../../shared/submissions.service';
import { UsersService } from '../../users/users.service';
import { OffersService } from '../../shared/offers.service';
import { AuthService } from '../../users/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  applications: any[] = [];
  offer: any;
  loading = true;
  showDeleteModal = false;
  deleteAppId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private submissionsService: SubmissionsService,
    private usersService: UsersService,
    private offersService: OffersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    const offerId = Number(this.route.snapshot.paramMap.get('id'));

    this.offersService.get(offerId).subscribe({
      next: (offer) => {
        this.offer = offer;
        const user = this.auth.getUser();
        if (user?.role !== 'company' || offer.companyId !== user.id) {
          this.router.navigate(['/company/offers']);
          return;
        }

        this.submissionsService.list().subscribe({
          next: (subs: any[]) => {
            const apps = subs.filter(s => s.offerId === offerId);
            if (apps.length === 0) {
              this.applications = [];
              this.loading = false;
              return;
            }

            const studentReqs = apps.map(s => this.usersService.get(s.studentId));
            forkJoin(studentReqs).subscribe({
              next: (students) => {
                this.applications = apps.map((a, i) => ({
                  ...a,
                  student: students[i]
                }));
                this.loading = false;
              }
            });
          }
        });
      },
      error: () => this.router.navigate(['/company/offers'])
    });
  }

  updateStatus(id: number, status: 'accepted' | 'rejected') {
    this.submissionsService.update(id, { status }).subscribe({
      next: () => {
        const app = this.applications.find(a => a.id === id);
        if (app) app.status = status;
      },
      error: () => alert('Failed to update status')
    });
  }

  confirmDelete(id: number) {
    this.deleteAppId = id;
    this.showDeleteModal = true;
  }

  deleteApplication() {
    if (!this.deleteAppId) return;

    this.submissionsService.delete(this.deleteAppId).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== this.deleteAppId);
        this.showDeleteModal = false;
        this.deleteAppId = null;
        alert('Application deleted successfully'); // Optional feedback
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete application');
        this.showDeleteModal = false;
        this.deleteAppId = null;
      }
    });
  }
}