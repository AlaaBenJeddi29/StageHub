// src/app/company/offers-list/offers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../shared/offers.service';
import { SubmissionsService } from '../../shared/submissions.service';
import { AuthService } from '../../users/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.css']
})
export class OffersListComponent implements OnInit {

  offers: any[] = [];
  filteredOffers: any[] = [];
  paginatedOffers: any[] = [];
  loading = true;

  // Filters & Sorting
  searchTerm = '';
  filterDomain = '';
  sortBy = 'newest';

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // Stats
  totalApplications = 0;
  averageApplications = 0;

  constructor(
    private offersService: OffersService,
    private submissionsService: SubmissionsService,
    private auth: AuthService,
    private router:
    Router
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    const currentUser = this.auth.getUser();
    if (!currentUser || currentUser.role !== 'company') {
      this.router.navigate(['/']);
      return;
    }

    const companyId = Number(currentUser.id);

    this.offersService.list().subscribe({
      next: (allOffers: any[]) => {
        const myOffers = allOffers.filter(o => Number(o.companyId) === companyId);

        this.submissionsService.list().subscribe({
          next: (subs: any[]) => {
            myOffers.forEach(offer => {
              offer.applicationCount = subs.filter(s => Number(s.offerId) === offer.id).length;
            });

            this.offers = myOffers;
            this.filteredOffers = [...this.offers];
            this.calculateStats();
            this.applyFilters();
            this.loading = false;
          }
        });
      },
      error: () => this.loading = false
    });
  }

  calculateStats() {
    this.totalApplications = this.offers.reduce((sum, o) => sum + (o.applicationCount || 0), 0);
    this.averageApplications = this.offers.length > 0 ? this.totalApplications / this.offers.length : 0;
  }

  applyFilters() {
    let result = [...this.offers];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(term) ||
        o.domain.toLowerCase().includes(term) ||
        o.location.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term)
      );
    }

    if (this.filterDomain) {
      result = result.filter(o => o.domain === this.filterDomain);
    }

    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'applicationsDesc': return (b.applicationCount || 0) - (a.applicationCount || 0);
        case 'applicationsAsc': return (a.applicationCount || 0) - (b.applicationCount || 0);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    this.filteredOffers = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterDomain = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.filterDomain || this.sortBy !== 'newest';
  }

  getSortLabel(): string {
    const labels: any = {
      newest: 'Newest First',
      oldest: 'Oldest First',
      applicationsDesc: 'Most Applications',
      applicationsAsc: 'Fewest Applications',
      title: 'Title A-Z'
    };
    return labels[this.sortBy];
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOffers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedOffers = this.filteredOffers.slice(start, start + this.pageSize);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getPageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  edit(id: number) {
    this.router.navigate(['/company/offers', id, 'edit']);
  }

  delete(id: number) {
    if (confirm('Delete this offer permanently?')) {
      this.offersService.delete(id).subscribe(() => this.loadOffers());
    }
  }

  viewApplications(id: number) {
    this.router.navigate(['/company/offers', id, 'candidatures']);
  }
}