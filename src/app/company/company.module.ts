import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyRoutingModule } from './company-routing.module';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OfferNewComponent } from './offer-new/offer-new.component';
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import { ApplicationsComponent } from './applications/applications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [OffersListComponent, OfferNewComponent, OfferEditComponent, ApplicationsComponent],
  imports: [CommonModule, CompanyRoutingModule, ReactiveFormsModule, HttpClientModule,
      CommonModule,
    CompanyRoutingModule,
    FormsModule
  ]
})
export class CompanyModule {}