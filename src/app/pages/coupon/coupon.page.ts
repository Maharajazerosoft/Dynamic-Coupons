import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import {
  IonInfiniteScroll,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { interval, Subscription } from 'rxjs';
// Services
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';

// Pages
import { CouponDetailsPage } from '../coupon-details/coupon-details.page';
import { SearchResultPage } from '../search-result/search-result.page';
import { GroceryPage } from '../grocery/grocery.page';

// AdMob for Capacitor
// import { AdMob } from '@capacitor-community/admob';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.page.html',
  styleUrls: ['./coupon.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent],
})
export class CouponPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  routeType: string = 'local';
  content: any[] = [];
  data: any[] = [];
  page: number = 1;
  perPage: number = 20;
  totalData: number = 0;
  totalPage: number = 0;
  searchlen: boolean = false;
  searchTerm: string = '';
  val: string = '';
  showButton: boolean = false;
  

  private subscriber?: Subscription;

  defaultImages = [
    'https://dynamiccoupons.com/webupload/thumb/default/default.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default5.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default8.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default9.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default10.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default14.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default7.png',
  ];

  isLoading: boolean = false;
  showAd: boolean = false;
  hasMoreData: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private detailsService: DetailsService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.routeType = params['type'] || 'local';
      this.initcontent();
    });
  }

  async ngOnInit() {
    await this.initializeAdMob();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showBannerAd();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  async initializeAdMob() {
    // try {
    //   const { status } = await AdMob.trackingAuthorizationStatus();
    //   await AdMob.initialize({
    //     requestTrackingAuthorization: true,
    //     testingDevices: [],
    //     initializeForTesting: false,
    //   }).then(() => {
    //     this.showAd = true;
    //   }).catch((error: any) => {
    //     console.error('AdMob initialization error:', error);
    //   });
    // } catch (error) {
    //   console.error('AdMob error:', error);
    // }
  }

  async showBannerAd() {
    // if (!this.showAd) return;
    // try {
    //   const options = {
    //     adId: 'ca-app-pub-8416006941552663/1243472245',
    //     isTesting: false,
    //     position: 'BOTTOM_CENTER',
    //     margin: 0
    //   };
    //   await AdMob.showBanner(options);
    // } catch (error) {
    //   console.error('Banner ad error:', error);
    // }
  }

  async initcontent() {
    await this.presentLoading();

    try {
      const response = await this.commonService.getCouponsList(this.routeType);

      if (response.status === '200') {
        this.data = response.data;
        localStorage.setItem('couponslist', JSON.stringify(response.data));

        this.content = this.data.slice(0, this.perPage);
        this.assignRandomDefaultImages();

        this.totalData = this.data.length;
        this.totalPage = 200;
        this.hasMoreData = this.content.length < this.totalData;

        await this.dismissLoading();
      } else {
        await this.dismissLoading();
        await this.presentToast(response.error || 'Failed to load coupons');
      }
    } catch (error) {
      await this.dismissLoading();
      await this.presentToast('Connection error');
      console.error('Error loading coupons:', error);
    }
  }

  loadcontent() {
    this.subscriber = interval(1000).subscribe(async () => {
      try {
        const response = await this.commonService.getCouponsList(
          this.routeType
        );
        if (response.status === '200') {
          this.data = response.data;
          localStorage.setItem('couponslist', JSON.stringify(response.data));

          this.content = this.data.slice(0, this.perPage);
          this.assignRandomDefaultImages();

          this.totalData = this.data.length;
          this.totalPage = 200;
          this.hasMoreData = this.content.length < this.totalData;
        }
      } catch (error) {
        console.error('Error refreshing coupons:', error);
      }
    });
  }

  async loadData(event: any) {
    this.totalPage = this.page * 20;

    setTimeout(() => {
      const startIndex = this.page * 20;
      const result = this.data.slice(startIndex);

      for (let k = 0; k < this.perPage; k++) {
        if (result[k] !== undefined) {
          this.content.push(result[k]);
        }
      }

      this.assignRandomDefaultImages();
      this.page += 1;
      event.target.complete();

      this.hasMoreData = this.page < 10;

      if (!this.hasMoreData) {
        event.target.disabled = true;
      }
    }, 2000);
  }

  async getclickdata() {
    try {
      const response = await this.commonService.getCouponsList1(this.routeType);
      if (response.status === '200') {
        this.data = response.data;
        localStorage.setItem('couponslist', JSON.stringify(response.data));

        this.content = this.data.slice(0, this.perPage);
        this.totalData = this.data.length;
        this.totalPage = 200;
        this.hasMoreData = this.content.length < this.totalData;
      }
    } catch (error) {
      console.error('Error loading click data:', error);
    }
  }

  nosearch() {
    const storedData = localStorage.getItem('couponslist');
    if (storedData) {
      this.data = JSON.parse(storedData);
      this.content = [];

      for (let i = 0; i <= 20; i++) {
        if (i < this.data.length) {
          this.content.push(this.data[i]);
        }
      }

      this.totalData = this.data.length;
      this.totalPage = 100;
      this.searchlen = false;
      this.hasMoreData = this.content.length < this.totalData;
    }
  }

  async inappclick(link: string, id: string) {
    const coupon = this.content.find((c: any) => c.web_id === id);
    if (coupon) {
      coupon.click_count = Number(coupon.click_count || 0) + 1;
      console.log(`Updated visit count for coupon ${id}:`, coupon.click_count);
    }

    try {
      await this.detailsService.updateclick({ id: id });
    } catch (error) {
      console.error('Error updating click count:', error);
    }

    await Browser.open({
      url: link,
      presentationStyle: 'popover',
      toolbarColor: '#08b8da',
    });
  }

  groceryclick(type: string) {
    console.log(type, 'type');
    this.router.navigate(['/grocery', { cat: type }]);
  }

  async nextPage(id: string, type: string, circulation: string, link: string) {

    console.log("iddddddddddddd",id);
    
    const coupon = this.content.find((c: any) => c.web_id === id);
    if (coupon) {
      coupon.click_count = Number(coupon.click_count || 0) + 1;
      console.log(`Updated visit count for coupon ${id}:`, coupon.click_count);
    }

    try {
      await this.detailsService.updateclick({ id: id });
    } catch (error) {
      console.error('Error updating click count:', error);
    }

    this.router.navigate(['/coupon-details'], { 
  queryParams: { cid: id } 
});
  }

  getItems(event: any) {
    this.val = event.target.value;
    console.log(this.val);
  }

  onCancel() {
    this.showButton = true;
  }

  searchresult() {
    const val = this.val;
    const search = 1;
    this.router.navigate(['/searchresults'], {
      queryParams: { val: val, search: search },
    });
  }

  assignRandomDefaultImages() {
    this.content.forEach((clocal: any) => {
      if (
        (!clocal.web_coupon_image_url || clocal.web_coupon_image_url === '') &&
        (!clocal.web_coupon_image || clocal.web_coupon_image === '')
      ) {
        const randomIndex = Math.floor(
          Math.random() * this.defaultImages.length
        );
        clocal.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
  }

  // New methods for template compatibility
  navigateToCategory(category: string) {
    this.groceryclick(category);
  }

  handleCouponClick(coupon: any) {
    if (coupon.image_type === 'img_link') {
      this.inappclick(coupon.web_coupon_url, coupon.web_id);
    } else if (coupon.image_type === 'img_upload') {
      this.nextPage(
        coupon.web_id,
        coupon.web_coupons_merchant_type,
        coupon.web_coupon_circulation,
        coupon.web_coupon_url
      );
    }
  }

  handleImageError(event: any, coupon: any) {
    event.target.src = this.defaultImages[0];
  }

  performSearch() {
    this.searchresult();
  }

  onSearchInput(event: any) {
    this.val = event.detail.value;
    console.log(this.val);
  }

  // Helper methods
  async presentLoading() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
    });
    await loading.present();
  }

  async dismissLoading() {
    this.isLoading = false;
    await this.loadingController.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }

  // For template compatibility with original method names
  getCouponImage(coupon: any): string {
    if (coupon.image_type === 'img_upload' && coupon.web_coupon_image) {
      return `https://www.dynamiccoupons.com/webupload/thumb/coupons/${coupon.web_coupon_image}`;
    } else if (
      coupon.image_type === 'img_link' &&
      coupon.web_coupon_image_url
    ) {
      return coupon.web_coupon_image_url;
    } else if (coupon.randomDefaultImage) {
      return coupon.randomDefaultImage;
    }
    return this.defaultImages[0];
  }

  getCardTitleClass(coupon: any): string {
    if (this.routeType === 'national') {
      if (coupon.web_xml_status === '1') return 'xml-color';
      if (coupon.web_coupons === '-2' && coupon.web_excel_status === '1')
        return 'excel-state';
      if (coupon.web_coupons_merchant_type === '2') return 'coupon-type2';
      if (coupon.web_coupons === '-2') return 'coupon-m2';
      return 'final-coupons';
    } else {
      if (coupon.web_coupons === '-1' && coupon.web_excel_status === '1')
        return 'excel-state';
      if (coupon.web_coupons === '-1') return 'final-coupons';
      if (coupon.web_coupons_merchant_type === '1') return 'coupon-type2';
      return '';
    }
  }

  // Alias for template compatibility
  loadMoreData(event: any) {
    this.loadData(event);
  }
}
