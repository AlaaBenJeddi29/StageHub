import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { ApplyComponent } from './apply/apply.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';

const routes: Routes = [
  { path: 'offers', component: OffersListComponent },
  { path: 'offers/:id', component: OfferDetailsComponent },
  { path: 'offers/:id/apply', component: ApplyComponent },
  { path: 'candidatures', component: MyApplicationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {}