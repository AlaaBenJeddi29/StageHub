import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentRoutingModule } from './student-routing.module';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { ApplyComponent } from './apply/apply.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [OffersListComponent, OfferDetailsComponent, ApplyComponent, MyApplicationsComponent],
  imports: [CommonModule, StudentRoutingModule, ReactiveFormsModule, HttpClientModule,
    FormsModule
  ]
})
export class StudentModule {}