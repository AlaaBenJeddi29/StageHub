// src/app/company/offer-new/offer-new.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OffersService } from '../../shared/offers.service';
import { AuthService } from '../../users/auth.service';

@Component({
  selector: 'app-offer-new',
  templateUrl: './offer-new.component.html'
})
export class OfferNewComponent {
  offerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private offersService: OffersService,
    private auth: AuthService,
    private router: Router
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

  onSubmit() {
    if (this.offerForm.invalid) return;

    const user = this.auth.getUser();
    const skillsArray = this.offerForm.value.requiredSkills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const offer = {
      ...this.offerForm.value,
      requiredSkills: skillsArray,
      companyId: user.id,
      companyName: user.name
    };

    this.offersService.create(offer).subscribe(() => {
      this.router.navigate(['/company/offers']);
    });
  }
}