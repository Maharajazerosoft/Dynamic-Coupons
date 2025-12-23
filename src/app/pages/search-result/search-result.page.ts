import { Component, OnInit, Pipe, PipeTransform, Input } from '@angular/core'; // Add Input
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  ToastController,
  InfiniteScrollCustomEvent,
  ModalController,
  MenuController
} from '@ionic/angular';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';
import { CouponDetailsPage } from '../coupon-details/coupon-details.page';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header.component';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-result.page.html',
  styleUrls: ['./search-result.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SafeHtmlPipe,
    HttpClientModule,
    HeaderComponent,
  ],
})
export class SearchResultPage implements OnInit {
  // Add these Inputs for modal mode
  @Input() searchValue: string = '';
  @Input() search: number = 1;

  submitted: boolean = true;
  resultStatus: string = 'exact';
  showButton: boolean = true;

  exactResult: any[] = [];
  data: any[] = [];
  relatedResult: any[] = [];
  dataR: any[] = [];

  page = 1;
  perPage = 20;
  totalData = 0;
  totalPage = 0;

  pageR = 1;
  perPageR = 20;
  totalDataR = 0;
  totalPageR = 0;

  menu: any;
  isMenuOpen = false;
  logoPath: string = 'assets/icon/logo.png';
  searchValue1: string = '';

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
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private menuCtrl: MenuController,
  ) {}

  ngOnInit() {
    if (this.searchValue && this.search === 1) {
      console.log('Loading from modal props:', this.searchValue);
      this.searchresult(this.searchValue);
    }
  }

  ionViewWillEnter() {
    console.log('SearchResultsPage loaded');
  }

  // Add this method to close modal
  closeModal() {
    this.modalController.dismiss();
  }

  // Add this method to handle coupon selection in modal mode
  selectCoupon(id: number) {
    this.modalController.dismiss({
      selectedCouponId: id,
      action: 'viewDetails',
    });
  }

  async nextPage(id: number, type?: any, circulation?: any, link?: string) {
    // Update click count
    let coupon;
    if (Array.isArray(this.exactResult)) {
      coupon = this.exactResult.find((c) => c.web_id === id);
    }
    if (!coupon && Array.isArray(this.relatedResult)) {
      coupon = this.relatedResult.find((c) => c.web_id === id);
    }

    if (coupon) {
      coupon.click_count = (coupon.click_count || 0) + 1;

      try {
        await this.detailsService.updateclick({ id: id });
      } catch (error) {
        console.error('Failed to update click count:', error);
      }
    }

    // Open coupon details as modal
    await this.openCouponDetailsModal(id);
  }

  // Add this new method to open coupon details modal
  async openCouponDetailsModal(cid: number) {
    const modal = await this.modalController.create({
      component: CouponDetailsPage,
      componentProps: {
        cid: cid,
      }
    });

    await modal.present();
  }

  // Keep all other methods EXACTLY as they are
  getSafeUrl(url: string): SafeResourceUrl {
    const modifiedSrcValue = this.getSrcFromIframeWithHttps(url) || '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(modifiedSrcValue);
  }

  getSrcFromIframeWithHttps(iframe: string): string | null {
    const srcRegex = /src=["'](.*?)["']/;
    const match = iframe.match(srcRegex);

    if (match) {
      const srcValue = match[1];
      const modifiedSrc = srcValue.replace('//', 'https://');
      return modifiedSrc;
    }

    return null;
  }

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  getItems(ev: any) {
    const val = ev.target.value;
    this.searchValue = val;

    if (val && val.trim() !== '') {
      if (val.length > 2) {
        this.showButton = true;
        this.submitted = true;
      } else {
        if (this.submitted === false) {
          this.showButton = true;
        }
      }
    }
  }

  async searchresult(key: string) {
    if (!key) return;

    const loading = await this.loadingController.create({
      message: 'Searching...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const response: any = await this.commonService.getsearch(key);
      console.log('Search response:', response);

      this.showButton = false;
      this.submitted = false;

      // Reset arrays
      this.exactResult = [];
      this.relatedResult = [];
      this.data = [];
      this.dataR = [];

      console.log('this.exactResult', this.exactResult);

      // Store exact results
      if (Array.isArray(response.exact)) {
        this.exactResult = response.exact;

        console.log('this.exactResult', this.exactResult);

        this.data = response.exact;
        this.totalData = response.exact.length;
        this.totalPage = Math.ceil(this.totalData / this.perPage);
      }

      // Store related results
      if (Array.isArray(response.related)) {
        this.relatedResult = response.related;

        console.log('this.relatedResult', this.relatedResult);
        this.dataR = response.related;
        this.totalDataR = response.related.length;
        this.totalPageR = Math.ceil(this.totalDataR / this.perPageR);
      }

      // Assign default images
      this.assignRandomDefaultImagesExact();
      this.assignRandomDefaultImagesRelated();

      await loading.dismiss();
    } catch (error) {
      console.error('Search error:', error);
      await loading.dismiss();

      const toast = await this.toastController.create({
        message: 'Connection error. Please try again.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async loadData(event: InfiniteScrollCustomEvent) {
    if (this.page * this.perPage >= this.totalData) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    setTimeout(() => {
      const startIndex = this.page * this.perPage;
      const endIndex = Math.min(startIndex + this.perPage, this.totalData);
      const result = this.data.slice(startIndex, endIndex);

      this.exactResult = [...this.exactResult, ...result];
      this.assignRandomDefaultImagesExact();

      this.page += 1;
      event.target.complete();

      if (this.page * this.perPage >= this.totalData) {
        event.target.disabled = true;
      }
    }, 1000);
  }

  async loadDataR(event: InfiniteScrollCustomEvent) {
    if (this.pageR * this.perPageR >= this.totalDataR) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    setTimeout(() => {
      const startIndex = this.pageR * this.perPageR;
      const endIndex = Math.min(startIndex + this.perPageR, this.totalDataR);
      const result = this.dataR.slice(startIndex, endIndex);

      this.relatedResult = [...this.relatedResult, ...result];
      this.assignRandomDefaultImagesRelated();

      this.pageR += 1;
      event.target.complete();

      if (this.pageR * this.perPageR >= this.totalDataR) {
        event.target.disabled = true;
      }
    }, 1000);
  }

  async inappclick(link: string, id: number) {
    // Update click count
    const coupon =
      this.exactResult.find((c) => c.web_id === id) ||
      this.relatedResult.find((c) => c.web_id === id);

    if (coupon) {
      coupon.click_count = (coupon.click_count || 0) + 1;
      console.log(`Updated visit count for coupon ${id}:`, coupon.click_count);

      try {
        await this.detailsService.updateclick({ id: id });
      } catch (error) {
        console.error('Failed to update click count:', error);
      }
    }

    // Open link in browser
    try {
      await Browser.open({ url: link });
    } catch (err) {
      console.error('Error opening browser:', err);
      window.open(link, '_blank');
    }
  }

  checkImageTagType(imageUrl: string): string {
    if (!imageUrl) return 'imgTag';

    const iframeRegex = /<iframe.*<\/iframe>/;
    const aTagRegex = /<a\s+href=["'](.*?)["']/;
    const aTagRegex2 = /<a\s+href=(.*?)>/;

    if (iframeRegex.test(imageUrl)) {
      return 'iframe';
    } else if (aTagRegex.test(imageUrl) || aTagRegex2.test(imageUrl)) {
      return 'aTag';
    } else {
      return 'imgTag';
    }
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  updateImageUrl(url: string): string {
    return url.replace(/src="\/\//g, 'src="https://');
  }

  assignRandomDefaultImagesExact() {
    this.exactResult.forEach((item: any) => {
      if (
        (!item.web_coupon_image_url || item.web_coupon_image_url === '') &&
        (!item.web_coupon_image || item.web_coupon_image === '')
      ) {
        const randomIndex = Math.floor(
          Math.random() * this.defaultImages.length
        );
        item.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
  }

  assignRandomDefaultImagesRelated() {
    this.relatedResult.forEach((item: any) => {
      if (
        (!item.web_coupon_image_url || item.web_coupon_image_url === '') &&
        (!item.web_coupon_image || item.web_coupon_image === '')
      ) {
        const randomIndex = Math.floor(
          Math.random() * this.defaultImages.length
        );
        item.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
  }

  performSearch() {
    if (this.searchValue && this.searchValue.trim().length > 0) {
      this.searchresult(this.searchValue.trim());
    }
  }

  trackByExactId(index: number, item: any): number {
    return item.web_id || index;
  }

  trackByRelatedId(index: number, item: any): number {
    return item.web_id || index;
  }

  toggleMenu() {
    // Implement menu toggle logic if needed
  }
}
