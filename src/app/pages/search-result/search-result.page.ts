import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  NavController, 
  LoadingController, 
  ToastController,
  InfiniteScrollCustomEvent
} from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from "@angular/platform-browser";
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
  standalone: true, // You have this commented out, but it seems like you want it
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    SafeHtmlPipe,
    HttpClientModule,
    HeaderComponent
  ]
})
export class SearchResultPage implements OnInit {
  submitted: boolean = true;
  resultStatus: string = 'exact';
  showButton: boolean = true;
  searchValue: string = '';
  
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

  defaultImages = [
    'https://dynamiccoupons.com/webupload/thumb/default/default.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default5.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default8.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default9.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default10.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default14.png',
    'https://dynamiccoupons.com/webupload/thumb/default/default7.png'
  ];

  constructor(
    private navController: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private detailsService: DetailsService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const val = params['val'];
      const search = params['search'];
      
      if (val) {
        this.searchValue = val;
        if (search === '1') {
          this.searchresult(val);
        }
      }
    });
  }

  ionViewWillEnter() {
    console.log('SearchResultsPage loaded');
    // Banner ad code removed for Capacitor
  }

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
    
    if (val && val.trim() !== "") {
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
      spinner: 'crescent'
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
      
      // Store exact results
      if (Array.isArray(response.exact)) {
        this.exactResult = response.exact;
        this.data = response.exact;
        this.totalData = response.exact.length;
        this.totalPage = Math.ceil(this.totalData / this.perPage);
      }
      
      // Store related results
      if (Array.isArray(response.related)) {
        this.relatedResult = response.related;
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
        color: 'danger'
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
    const coupon = this.exactResult.find(c => c.web_id === id) || 
                   this.relatedResult.find(c => c.web_id === id);
    
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

  async nextPage(id: number, type?: any, circulation?: any, link?: string) {
    // Update click count
    let coupon;
    if (Array.isArray(this.exactResult)) {
      coupon = this.exactResult.find(c => c.web_id === id);
    }
    if (!coupon && Array.isArray(this.relatedResult)) {
      coupon = this.relatedResult.find(c => c.web_id === id);
    }
    
    if (coupon) {
      coupon.click_count = (coupon.click_count || 0) + 1;
      
      try {
        await this.detailsService.updateclick({ id: id });
      } catch (error) {
        console.error('Failed to update click count:', error);
      }
    }
    
    // Navigate to coupon details
    this.router.navigate(['/coupon-details'], {
      queryParams: { cid: id }
    });
    
    // Alternative: Open external link directly
    // if (link && (!circulation || (type !== 1 && type !== 2))) {
    //   try {
    //     await Browser.open({ url: link });
    //   } catch (err) {
    //     window.open(link, '_blank');
    //   }
    // } else {
    //   this.router.navigate(['/coupon-details'], {
    //     queryParams: { cid: id }
    //   });
    // }
  }

  navigateHome() {
    this.router.navigate(['/intro']);
  }

  navigateLearn() {
    this.router.navigate(['/pricing']);
  }

  // For backward compatibility
  home() {
    this.navigateHome();
  }

  learn() {
    this.navigateLearn();
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
      if ((!item.web_coupon_image_url || item.web_coupon_image_url === '') && 
          (!item.web_coupon_image || item.web_coupon_image === '')) {
        const randomIndex = Math.floor(Math.random() * this.defaultImages.length);
        item.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
  }

  assignRandomDefaultImagesRelated() {
    this.relatedResult.forEach((item: any) => {
      if ((!item.web_coupon_image_url || item.web_coupon_image_url === '') && 
          (!item.web_coupon_image || item.web_coupon_image === '')) {
        const randomIndex = Math.floor(Math.random() * this.defaultImages.length);
        item.randomDefaultImage = this.defaultImages[randomIndex];
      }
    });
  }

  // Helper method for search
  performSearch() {
    if (this.searchValue && this.searchValue.trim().length > 0) {
      this.searchresult(this.searchValue.trim());
    }
  }

  // TrackBy functions for performance
  trackByExactId(index: number, item: any): number {
    return item.web_id || index;
  }

  trackByRelatedId(index: number, item: any): number {
    return item.web_id || index;
  }

  // Back navigation
  goBack() {
    this.navController.back();
  }

  // Menu toggle (if you have a menu)
  toggleMenu() {
    // Implement menu toggle logic if needed
  }
}