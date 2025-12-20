import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import {
  IonInfiniteScroll,
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { interval, Subscription } from 'rxjs';

import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';
import { CouponDetailsPage } from '../coupon-details/coupon-details.page';
import { SearchResultPage } from '../search-result/search-result.page';
import { GroceryPage } from '../grocery/grocery.page';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-coupon-modal',
  templateUrl: './coupon.page.html',
  styleUrls: ['./coupon.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent],
})
export class CouponPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  @Input() type: string = 'local';
  @Input() title: string = '';

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
    private router: Router,
    private commonService: CommonService,
    private detailsService: DetailsService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    await this.initcontent();
  }

  ngAfterViewInit() {
    // Your existing code
  }

  ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async initcontent() {
    await this.presentLoading();

    try {
      const response = await this.commonService.getCouponsList(this.type);

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

  // UPDATED: Open grocery page as modal
  async groceryclick(type: string) {
    console.log(type, 'type');

    // Close current modal first
    await this.modalController.dismiss();

    // Open grocery page as modal
    await this.openGroceryModal(type);
  }

  // UPDATED: New method to open grocery modal
  async openGroceryModal(category: string) {
    const modal = await this.modalController.create({
      component: GroceryPage,
      componentProps: {
        cat: category,
      },
      cssClass: 'grocery-modal',
      backdropDismiss: true,
    });

    await modal.present();
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

    await this.closeModal();

    await Browser.open({
      url: link,
      presentationStyle: 'popover',
      toolbarColor: '#08b8da',
    });
  }

  async nextPage(id: number, type: string, circulation: string, link: string) {
    console.log('Coupon ID:', id);

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

    // Close modal first
    await this.modalController.dismiss();

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

  async searchresult() {
    const searchValue = this.val;

    if (!searchValue || searchValue.trim() === '') {
      // Optional: Show toast message if search is empty
      const toast = await this.toastController.create({
        message: 'Please enter search terms',
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    await this.modalController.dismiss();

    const modal = await this.modalController.create({
      component: SearchResultPage,
      componentProps: {
        searchValue: searchValue,
        search: 1,
      },
    });

    await modal.present();
  }

  getItems(event: any) {
    this.val = event.target.value;
    console.log(this.val);
  }

  onCancel() {
    this.showButton = true;
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

  loadMoreData(event: any) {
    this.loadData(event);
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

  getCardTitleClass(coupon: any): string {
    if (this.type === 'national') {
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

  async navigateToCategory(category: string) {
    console.log('Navigating to category:', category);

    // Close current modal first
    await this.modalController.dismiss();

    // Open grocery page as modal
    await this.openGroceryModal(category);
  }
}
