import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CouponDetailsPageRoutingModule } from './coupon-details-routing.module';

import { CouponDetailsPage } from './coupon-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CouponDetailsPageRoutingModule
  ],
  declarations: [CouponDetailsPage]
})
export class CouponDetailsPageModule {}
