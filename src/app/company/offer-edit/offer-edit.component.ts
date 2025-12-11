// src/app/company/offer-edit/offer-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService } from '../../shared/offers.service';
import { AuthService } from '../../users/auth.service';

@Component({
  selector: 'app-offer-edit',
  templateUrl: './offer-edit.component.html'
})
export class OfferEditComponent implements OnInit {
  offerForm: FormGroup;
  offerId!: number;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private offersService: OffersService,
    private auth: AuthService
  ) {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      domain: ['', Validators.required],
      description: ['', Validators.required],
      contractType: ['Internship'],
      requiredSkills: ['']
    });
  }

  ngOnInit(): void {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));

    this.offersService.get(this.offerId).subscribe({
      next: (offer) => {
        // Check ownership
        const user = this.auth.getUser();
        if (user.role !== 'company' || offer.companyId !== user.id) {
          this.router.navigate(['/company/offers']);
          return;
        }

        // Convert skills array → string
        const skillsString = (offer.requiredSkills || []).join(', ');

        this.offerForm.patchValue({
          title: offer.title,
          location: offer.location,
          domain: offer.domain,
          description: offer.description,
          contractType: offer.contractType || 'Internship',
          requiredSkills: skillsString
        });

        this.loading = false;
      },
      error: () => {
        alert('Offer not found or access denied');
        this.router.navigate(['/company/offers']);
      }
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid || this.loading) return;

    const skillsArray = this.offerForm.value.requiredSkills
      ? this.offerForm.value.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const updatedOffer = {
      ...this.offerForm.value,
      requiredSkills: skillsArray
    };

    this.offersService.update(this.offerId, updatedOffer).subscribe({
      next: () => {
        this.router.navigate(['/company/offers']);
      },
      error: () => alert('Failed to update offer')
    });
  }
}