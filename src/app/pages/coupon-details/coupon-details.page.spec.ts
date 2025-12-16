import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CouponDetailsPage } from './coupon-details.page';

describe('CouponDetailsPage', () => {
  let component: CouponDetailsPage;
  let fixture: ComponentFixture<CouponDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
