import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Subscription, interval } from 'rxjs';
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';
import { CouponDetailsPage } from '../coupon-details/coupon-details.page';

@Component({
  selector: 'app-grocery',
  templateUrl: 'grocery.page.html',
  styleUrls: ['grocery.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class GroceryPage implements OnInit, OnDestroy {
  @Input() cat: string = ''; // Category from modal props

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
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    console.log('Grocery modal opened with category:', this.cat);
    await this.initcontent();
  }

  ngOnDestroy(): void {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  // MODAL METHODS
  async closeModal() {
    await this.modalController.dismiss();
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

    // Close modal before opening browser
    await this.closeModal();

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

    // Close modal first
    await this.closeModal();

    await this.openCouponDetailsModal(id);
  }

  // Add this new method to open coupon details modal
  async openCouponDetailsModal(cid: number) {
    const modal = await this.modalController.create({
      component: CouponDetailsPage,
      componentProps: {
        cid: cid,
      },
    });

    await modal.present();
  }

  // SEARCH METHODS
  getItems(ev: any) {
    this.val = ev.detail.value;
  }

  onCancel() {
    this.showButton = true;
  }

  async searchresult() {
    const searchValue = this.val;

    if (!searchValue || searchValue.trim() === '') {
      await this.presentToast('Please enter search terms');
      return;
    }

    // Close current modal
    await this.closeModal();

    // Parent component (CouponPage) should handle opening search modal
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
    if (this.modalController) {
      console.log('🔙 Closing modal');
      this.modalController.dismiss();
    }
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

  performSearch() {
    this.searchresult();
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
