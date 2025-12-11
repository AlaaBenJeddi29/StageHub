// src/app/student/offers-list/offers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../shared/offers.service';
import { SubmissionsService } from '../../shared/submissions.service';
import { AuthService } from '../../users/auth.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.css']
})
export class OffersListComponent implements OnInit {
  offers: any[] = [];
  filteredOffers: any[] = [];
  loading = true;

  // Filters
  searchTerm = '';
  filterDomain = '';
  minMatch = 0;

  constructor(
    private offersService: OffersService,
    private submissionsService: SubmissionsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getUser();
    if (!currentUser || currentUser.role !== 'student') {
      this.router.navigate(['/users/login']);
      return;
    }

    const userId = currentUser.id;
    const userSkills = (currentUser.skills || []).map((s: string) => s.trim().toLowerCase());

    forkJoin([
      this.offersService.list(),
      this.submissionsService.list()
    ]).subscribe({
      next: ([allOffers, allSubs]) => {
        const myApplications = allSubs
          .filter((s: any) => s.studentId === userId)
          .map((s: any) => s.offerId);

        this.offers = allOffers.map(offer => {
          const required = (offer.requiredSkills || []).map((s: string) => s.trim().toLowerCase());
          const matched = userSkills.filter((skill: any) => required.includes(skill)).length;
          const matchScore = required.length > 0 ? Math.round((matched / required.length) * 100) : 0;

          return {
            ...offer,
            matchScore,
            matchedCount: matched,
            totalRequired: required.length,
            alreadyApplied: myApplications.includes(offer.id),
            saved: false // You can persist this later with localStorage or backend
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

        this.filteredOffers = [...this.offers];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load internships');
      }
    });
  }

  applyFilters() {
    let result = [...this.offers];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(term) ||
        o.companyName.toLowerCase().includes(term) ||
        o.domain.toLowerCase().includes(term) ||
        o.location.toLowerCase().includes(term)
      );
    }

    if (this.filterDomain) {
      result = result.filter(o => o.domain === this.filterDomain);
    }

    if (this.minMatch > 0) {
      result = result.filter(o => o.matchScore >= this.minMatch);
    }

    this.filteredOffers = result;
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterDomain = '';
    this.minMatch = 0;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.filterDomain || this.minMatch > 0;
  }

  getMatchClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'great';
    if (score >= 50) return 'good';
    return 'low';
  }

  toggleSave(offer: any) {
    offer.saved = !offer.saved;
    // Optional: Save to localStorage or backend later
  }

  viewDetails(id: number) {
    this.router.navigate(['/student/offers', id]);
  }
}