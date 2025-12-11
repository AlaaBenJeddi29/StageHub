import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService } from '../../shared/offers.service';
import { AuthService } from '../../users/auth.service';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html'
})

export class OfferDetailsComponent implements OnInit {
  offer: any;

  constructor(
    private route: ActivatedRoute,
    private offersService: OffersService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    const userSkills = (this.auth.getUser()?.skills || []).map((s: string) => s.toLowerCase());

    this.offersService.get(id).subscribe(offer => {
      const required = (offer.requiredSkills || []).map((s: string) => s.toLowerCase());
      const matched = userSkills.filter((s: string) => required.includes(s)).length;
      const score = required.length > 0 ? Math.round((matched / required.length) * 100) : 0;

      this.offer = { ...offer, matchScore: score };
    });
  }

  apply() {
    this.router.navigate(['/student/offers', this.offer.id, 'apply']);
  }
}