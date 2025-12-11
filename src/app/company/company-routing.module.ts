import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OfferNewComponent } from './offer-new/offer-new.component';
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import { ApplicationsComponent } from './applications/applications.component';

const routes: Routes = [
  { path: 'offers', component: OffersListComponent },
  { path: 'offers/new', component: OfferNewComponent },
  { path: 'offers/:id/edit', component: OfferEditComponent },
  { path: 'offers/:id/candidatures', component: ApplicationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule {}