import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  LoadingController,
  ToastController,
  NavController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';

@Component({
  selector: 'app-grocery',
  templateUrl: 'grocery.page.html',
  styleUrls: ['grocery.page.scss'],
  standalone: false,
})
export class GroceryPage implements OnInit, OnDestroy {
  cat: string = ''; // Category from route params

  val: any;
  content: any = [];
  data: any;
  page = 1;
  perPage = 20;
  totalData = 0;
  totalPage = 0;
  searchlen: boolean = false;
  subscriber: Subscription | undefined;
  showButton: boolean = false;
  hasMoreData: boolean = true;
  isLoading: boolean = false;
  menu: any;
  isMenuOpen = false;
  logoPath: string = 'assets/icon/logo.png';

  defaultImages = [
    'https://dynamiccoupons.com/webupload/thumb/default/default.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default5.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default8.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default9.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default10.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default14.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default7.png',
  ];

  constructor(
    private commonService: CommonService,
    private detailsService: DetailsService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    // Get category from route parameters
    this.route.paramMap.subscribe(params => {
      const categoryParam = params.get('category');
      if (categoryParam) {
        this.cat = categoryParam;
      }
      console.log('Grocery page opened with category:', this.cat);
      this.initcontent();
    });
  }

  ngOnDestroy(): void {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }


  async initcontent() {
    await this.presentLoading();

    try {
      const response = await this.commonService.getCouponsList(this.cat);

      if (response.status === '200') {
        this.content = [];
        this.data = response.data;
        localStorage.setItem('couponslist', JSON.stringify(response.data));

        // Load first page
        for (let i = 0; i < this.perPage; i++) {
          if (i < this.data.length) {
            this.content.push(this.data[i]);
          }
        }

        this.assignRandomDefaultImages();
        this.totalData = this.data.length;
        this.hasMoreData = this.content.length < this.totalData;

        await this.dismissLoading();
      } else {
        await this.dismissLoading();
        await this.presentToast(response.error || 'Failed to load offers');
      }
    } catch (error) {
      await this.dismissLoading();
      await this.presentToast('Connection error');
      console.error('Error loading grocery coupons:', error);
    }
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

      this.hasMoreData = this.page * 20 < this.totalData;

      if (!this.hasMoreData) {
        event.target.disabled = true;
      }
    }, 2000);
  }

  // CLICK HANDLERS
  async inappclick(link: any, id: any) {
    // Update click count locally
    const coupon = this.content.find((c: any) => c.web_id === id);
    if (coupon) {
      coupon.click_count = Number(coupon.click_count || 0) + 1;
      console.log(`Updated visit count for coupon ${id}:`, coupon.click_count);
    }

    // Send update to server
    try {
      await this.detailsService.updateclick({ id: id });
      console.log('Click count updated on server');
    } catch (error) {
      console.error('Error updating click count:', error);
    }

    await Browser.open({
      url: link,
      presentationStyle: 'popover',
      toolbarColor: '#08b8da',
    });
  }

  async nextPage(id: any, type: any, circulation: any, link: any) {
    // Update click count locally
    const coupon = this.content.find((c: any) => c.web_id === id);
    if (coupon) {
      coupon.click_count = Number(coupon.click_count || 0) + 1;
      console.log(`Updated visit count for coupon ${id}:`, coupon.click_count);
    }

    // Send update to server
    try {
      await this.detailsService.updateclick({ id: id });
      console.log('Click count updated on server');
    } catch (error) {
      console.error('Error updating click count:', error);
    }

    // Navigate to coupon details page
    this.navController.navigateForward(['/coupon-details', id]);
  }

  // SEARCH METHODS
  getItems(ev: any) {
    this.val = ev.detail.value;
  }

  onCancel() {
    this.showButton = true;
  }

  async searchresult(key: string) {
    if (!key) return;

    const searchValue = this.val;

    if (!searchValue || searchValue.trim() === '') {
      const toast = await this.toastController.create({
        message: 'Please enter search terms',
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    // Navigate to search result page
    this.router.navigate(['/search-result'], {
      queryParams: { search: searchValue }
    });
  }

  // HELPER METHODS
  assignRandomDefaultImages() {
    this.content.forEach((grocery: any) => {
      if (
        (!grocery.web_coupon_image_url ||
          grocery.web_coupon_image_url === '') &&
        (!grocery.web_coupon_image || grocery.web_coupon_image === '')
      ) {
        const randomIndex = Math.floor(
          Math.random() * this.defaultImages.length
        );
        grocery.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
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

  // Navigation
  goBack() {
    this.navController.back();
  }

  handleImageError(event: any, coupon: any) {
    event.target.src = this.defaultImages[0];
  }

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

  onSearchInput(event: any) {
    this.val = event.detail.value;
  }

  loadMoreData(event: any) {
    this.loadData(event);
  }

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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.menu) {
      if (this.isMenuOpen) {
        this.menu.open();
      } else {
        this.menu.close();
      }
    }
  }
}
