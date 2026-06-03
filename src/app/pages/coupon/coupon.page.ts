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
  AlertController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Subscription } from 'rxjs';

import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';
import { AdMobBannerManager } from '../../../providers/admob/admob-banner-manager';
import { AdMobService } from '../../../providers/admob/admob';

import { Keyboard } from '@capacitor/keyboard';

export interface CouponCategoryLink {
  slug: string;
  label: string;
  tooltip: string;
}

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

  private keyboardShowListener: any;
  private keyboardHideListener: any;


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

  /** Local offers category shortcuts (paired rows in template). Order matches product spec 1–22. */
  readonly couponCategoryLinks: CouponCategoryLink[] = [
    {
      slug: 'national-brands',
      label: 'National Brands & Online Deals',
      tooltip:
        'U.S. national retailers, affiliate offers, manufacturer deals, online shopping promotions, shipping perks.',
    },
    {
      slug: 'local-businesses',
      label: 'Local Businesses & Services',
      tooltip:
        'Restaurants, salons, shops, professional services, lawyers, legal services, consultants, brick-and-mortar businesses.',
    },
    {
      slug: 'trending-creator',
      label: 'Trending, Viral & Creator Deals',
      tooltip:
        'Viral deals, flash sales, limited-time drops, social trends, influencer promotions, blog codes, podcast codes, creator discount links, hot promotions.',
    },
    {
      slug: 'community-events',
      label: 'Community Events & Local Listings',
      tooltip:
        'Garage sales, yard sales, meetups, fundraisers, non-profits, community events, casual local listings.',
    },
    {
      slug: 'grocery',
      label: 'Grocery, Weekly Flyers, Deals',
      tooltip:
        'Food trucks, farmers markets, fresh produce, store flyers, stalls.',
    },
    {
      slug: 'birthday',
      label: 'Birthday Offers & Freebies',
      tooltip:
        'Birthday rewards, free items, loyalty birthday perks, special occasion deals.',
    },
    {
      slug: 'home',
      label: 'Home, Household & Living',
      tooltip:
        'Furniture, appliances, décor, cleaning supplies, home essentials, hobby supplies, DIY, crafts, games, collectibles, personal interests.',
    },
    {
      slug: 'beauty',
      label: 'Beauty, Health & Fitness',
      tooltip:
        'Skincare, wellness, gyms, supplements, personal care, fitness services.',
    },
    {
      slug: 'books',
      label: 'Education & Learning Programs',
      tooltip:
        'K–12 education, college admissions, online courses, certifications, tutoring, libraries, learning tools.',
    },
    {
      slug: 'student',
      label: 'Student Resources & Perks',
      tooltip:
        'Student deals, campus perks, education pricing, academic offers.',
    },
    {
      slug: 'business',
      label: 'Minority, Ethnic Businesses',
      tooltip:
        'Cultural stores, community vendors, identity-based discovery, local cultural commerce.',
    },
    {
      slug: 'discounts',
      label: 'Senior Resources & Perks',
      tooltip:
        'Senior savings, age-based discounts, retirement perks, senior programs.',
    },
    {
      slug: 'military',
      label: 'Military & Veteran Discounts',
      tooltip:
        'Service member deals, veteran benefits, military-exclusive offers.',
    },
    {
      slug: 'babies',
      label: 'Parenting, Babies, Children & Toys',
      tooltip:
        'Baby products, kids items, parenting tools, toys, family essentials.',
    },
    {
      slug: 'holidays',
      label: 'Holidays, Contests & Sweepstakes',
      tooltip:
        'Seasonal events, giveaways, sweepstakes, holiday promotions, contests.',
    },
    {
      slug: 'real-estate',
      label: 'Real Estate, Homes & Rentals',
      tooltip:
        'Housing listings, rentals, buying homes, property services, real estate market.',
    },
    {
      slug: 'supplies',
      label: 'Pets & Animal Care',
      tooltip:
        'Pet supplies, vet services, grooming, animal wellness, pet products.',
    },
    {
      slug: 'finance',
      label: 'Finance, Insurance & Automotive',
      tooltip:
        'Banking, credit, insurance, car deals, maintenance, financial services, vehicles.',
    },
    {
      slug: 'productivity',
      label: 'Jobs, Careers & Technology',
      tooltip:
        'Job listings, hiring, tech careers, freelancing, resumes, career tools, employment platforms.',
    },
    {
      slug: 'digital-services',
      label: 'Digital Services & Subscriptions',
      tooltip:
        'SaaS tools, streaming subscriptions, software deals, AI tools, productivity apps, website services, digital memberships, online platforms, cloud tools.',
    },
    {
      slug: 'travel',
      label: 'Travel, Experiences & Tickets',
      tooltip:
        'Flights, airline tickets, hotels, transport, sports tickets, concert tickets, theater shows, cultural events, tours, attractions, travel packages, global experiences outside the U.S.',
    },
    {
      slug: 'parenting',
      label: 'Global Brands & Deals (All Countries except U.S.)',
      tooltip:
        'International retailers, foreign brands, cross-border e-commerce, global shopping promotions.',
    },
  ];

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
    private alertController: AlertController,
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
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners() {

    // Keyboard opened
    this.keyboardShowListener = Keyboard.addListener(
      'keyboardDidShow',
      async () => {
        console.log('Keyboard opened');
  
        await this.admobService.removeBannerAd();
  
        // Remove white space
        document.documentElement.style.setProperty('--admob-space', '0px');
        document.documentElement.style.setProperty('--border-n-height','calc(100vh - 229px');
      }
    );
  
    // Keyboard closed
    this.keyboardHideListener = Keyboard.addListener(
      'keyboardDidHide',
      async () => {
        console.log('Keyboard closed');
  
        await this.admobService.showBannerAd();
  
        // Restore white space
        document.documentElement.style.setProperty('--admob-space', '99px');
        document.documentElement.style.setProperty('--border-n-height','calc(100vh - 328px');
      }
    );
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

  async ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }

  await this.admobService.removeBannerAd();

  if (this.keyboardShowListener) {
    this.keyboardShowListener.remove();
  }

  if (this.keyboardHideListener) {
    this.keyboardHideListener.remove();
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
    // if (coupon.image_type === 'img_link') {
    //   this.inappclick(coupon.web_coupon_url, coupon.web_id);
    // } else if (coupon.image_type === 'img_upload') {
      this.nextPage(
        coupon.web_id,
        coupon.web_coupons_merchant_type,
        coupon.web_coupon_circulation,
        coupon.web_coupon_url
      );
    }
  //}

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
  goBackArrow() {
    this.navController.back();
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

  // navigateToCategory(category: string) {
  //   console.log('Navigating to category:', category);
  //   // Same destinations as search browse buttons for these two entries only.
  //   if (category === 'local-businesses') {
  //     this.router.navigate(['/coupon', 'local']);
  //     return;
  //   }
  //   if (category === 'national-brands') {
  //     this.router.navigate(['/coupon', 'national']);
  //     return;
  //   }
  //   this.router.navigate(['/grocery', category]);
  // }

  navigateToCategory(category: string) {
    console.log('Navigating to category:', category);
    if (category === 'local-businesses') {
      if (this.type === 'local') {
        this.page = 1;
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = false;
        }
        void this.initcontent().then(() =>
          requestAnimationFrame(() => {
            void this.ionContent?.scrollToTop(0);
            this.cdr.detectChanges();
          })
        );
      } else {
        this.router.navigate(['/coupon', 'local']);
      }
      return;
    }
    if (category === 'national-brands') {
      this.router.navigate(['/coupon', 'national']);
      return;
    }
    this.router.navigate(['/grocery', category]);
  }

  async showCategoryTooltip(event: Event, link: CouponCategoryLink) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      cssClass: 'category-tooltip-alert',
      header: link.label,
      message: link.tooltip,
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await alert.present();
  }

  get categoryRows(): CouponCategoryLink[][] {
    const rows: CouponCategoryLink[][] = [];
    const list = this.couponCategoryLinks;
    for (let i = 0; i < list.length; i += 2) {
      rows.push([list[i], list[i + 1]]);
    }
    return rows;
  }

  trackByCouponId(index: number, item: any): string {
    return item.web_id || index;
  }
}
