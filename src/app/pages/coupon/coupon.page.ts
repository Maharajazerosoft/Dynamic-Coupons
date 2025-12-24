import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  IonInfiniteScroll,
  IonContent,
  LoadingController,
  ToastController,
  NavController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Subscription } from 'rxjs';

import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';
import { AdMobBannerManager } from '../../../providers/admob/admob-banner-manager';
import { AdMobService } from '../../../providers/admob/admob';

@Component({
  selector: 'app-coupon-modal',
  templateUrl: './coupon.page.html',
  styleUrls: ['./coupon.page.scss'],
  standalone: false,
})
export class CouponPage
  extends AdMobBannerManager
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonContent) ionContent!: IonContent;

  type: string = 'local';
  title: string = '';
  renderGrid: boolean = false;

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
  searchValue1: string = '';

  protected override pageName: string = 'CouponPage';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private detailsService: DetailsService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private cdr: ChangeDetectorRef,
    protected override admobService: AdMobService
  ) {
    super(admobService);
  }

  async ngOnInit() {
    // Get type from route parameters
    this.route.paramMap.subscribe((params) => {
      const typeParam = params.get('type');
      if (typeParam) {
        this.type = typeParam;
      }
      this.initcontent();
    });
  }

  ngAfterViewInit() {}

  ionViewWillEnter() {
    console.log('CouponPage loaded');

    // Controlled one-time reload to fix ion-content offset issue
    const reloadKey = 'coupon-reloaded';
    const navigationType = (
      performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
    )?.type;

    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true');
      console.log('Performing controlled reload for coupon page');
      window.location.reload();
      return;
    }

    // Clear the flag after successful reload to allow future navigation
    if (navigationType === 'reload') {
      sessionStorage.removeItem(reloadKey);
    }
  }

  override async ionViewDidEnter() {
    await super.ionViewDidEnter();
    requestAnimationFrame(() => {
      this.cdr.detectChanges();
      this.ionContent.scrollToTop(0);
    });
  }

  ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  goBack() {
    this.navController.back();
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

        // Data is loaded and bound, allow grid to render
        this.cdr.detectChanges();
        this.renderGrid = true;
        this.cdr.detectChanges();
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

  // Navigate to grocery page
  groceryclick(category: string) {
    console.log(category, 'category');
    this.router.navigate(['/grocery', category]);
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

    // Navigate to coupon details page
    this.navController.navigateForward(['/coupon-details', id]);
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
      queryParams: { search: searchValue },
    });
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

  navigateToCategory(category: string) {
    console.log('Navigating to category:', category);
    this.router.navigate(['/grocery', category]);
  }

  trackByCouponId(index: number, item: any): string {
    return item.web_id || index;
  }
}
