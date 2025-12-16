import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CouponDetailsPage } from './coupon-details.page';

const routes: Routes = [
  {
    path: '',
    component: CouponDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponDetailsPageRoutingModule {}
