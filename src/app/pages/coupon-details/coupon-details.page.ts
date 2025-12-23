import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  AlertController,
  NavController,
  ToastController,
  LoadingController,
  Platform,
  AlertInput,
} from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';

// Import your services
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';

declare const google: any;

@Component({
  selector: 'app-coupon-details',
  templateUrl: './coupon-details.page.html',
  styleUrls: ['./coupon-details.page.scss'],
  standalone: false,
})
export class CouponDetailsPage implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  cid: any;

  // Variables - matching your original names
  sanitizedHtml: SafeHtml;
  emailHistory: string[] = [];
  DCloginEmail: any;
  overAllHtmlStr: any;
  overAllCidStr: any;
  viewredeem = false;
  imageAttach = false;
  emailredeem: any;
  useremail: any;
  details: any = {};
  viewmodal = false;
  address: any;
  city: any;
  country: any;
  directionsService: any;
  directionsRenderer: any;
  state: any;
  postalcode: any;
  map: any;
  marker: any;

  menu: any;
  isMenuOpen = false;
  logoPath: string = 'assets/icon/logo.png';

  // New variables for better state management
  isLoading = false;
  error: string | null = null;
  name: '' | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _detailsService: DetailsService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private navController: NavController,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml('');
  }

  public alertInputs: AlertInput[] = [];

  async ngOnInit() {
    console.log('🔄 Initializing CouponDetailsPage...');

    // Get coupon ID from route parameters
    this.route.paramMap.subscribe((params) => {
      this.cid = params.get('id');
      console.log('🆔 Coupon ID from route:', this.cid);

      if (this.cid) {
        this.initLoad();
      } else {
        console.error('❌ No coupon ID provided in route');
        this.error = 'No coupon ID provided';
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    // Initialize map after view is loaded
    if (this.details.web_coupon_address) {
      setTimeout(() => this.initializeMap(), 500);
    }
  }

  ionViewWillEnter() {
    console.log('CouponPage loaded');

    // Controlled one-time reload to fix ion-content offset issue
    const reloadKey = 'coupon-details-reloaded';
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

  async initLoad() {
    this.isLoading = true;
    this.error = null;

    console.log('🔄 Starting initialization...');

    try {
      // Load user email and history in parallel
      await Promise.all([this.loadUserEmail(), this.loadEmailHistory()]);

      console.log('🔍 Loading coupon content...');
      await this.initcontent();

      this.isLoading = false;
      console.log('✅ INITLOAD COMPLETED');
    } catch (error) {
      console.error('❌ Error in initLoad:', error);
      this.error = 'Failed to load coupon details. Please try again.';
      this.isLoading = false;
    }
  }

  async loadUserEmail() {
    try {
      const { value } = await Preferences.get({ key: 'userEmail' });
      this.DCloginEmail = value;
      this.emailredeem = value;
    } catch (error) {
      console.error('Error loading user email:', error);
    }
  }

  async loadEmailHistory() {
    try {
      const { value } = await Preferences.get({ key: 'emailHistory' });
      this.emailHistory = value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error loading email history:', error);
    }
  }

  async initcontent() {
    if (!this.cid) {
      console.error('❌ Cannot init content: No coupon ID');
      this.error = 'Invalid coupon ID';
      return;
    }

    console.log('🔍 INITCONTENT called for CID:', this.cid);

    const loading = await this.loadingController.create({
      message: 'Loading coupon details...',
    });

    try {
      await loading.present();

      console.log('🔍 Calling API for coupon ID:', this.cid);
      const Response = await this._detailsService.getContent(this.cid);
      console.log('🔍 API Response status:', Response.status);

      if (Response.status === '200') {
        this.details = Response.data;
        console.log('✅ Details loaded successfully');

        // Process the data
        if (this.details.web_content) {
          this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.details.web_content
          );
        }

        // Initialize map if needed
        if (this.details.latitude && this.details.longitude) {
          this.initializeMap();
        }
      } else {
        throw new Error(`API returned status: ${Response.status}`);
      }
    } catch (error) {
      console.error('❌ Error in initcontent:', error);
      this.error = 'Failed to load coupon details. Please try again.';
    } finally {
      await loading.dismiss();
    }
  }

  async initializeMap() {
    if (!this.mapElement?.nativeElement || !this.address) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${this.address}, ${this.city}, ${this.country}, ${this.state}, ${this.postalcode}`;

      geocoder.geocode(
        { address: fullAddress },
        (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const latitude = results[0].geometry.location.lat();
            const longitude = results[0].geometry.location.lng();
            const latlng = new google.maps.LatLng(latitude, longitude);

            const mapOptions = {
              center: latlng,
              zoom: 14,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.map = new google.maps.Map(
              this.mapElement.nativeElement,
              mapOptions
            );

            this.marker = new google.maps.Marker({
              position: latlng,
              map: this.map,
              title: this.details.web_coupon_bname,
            });

            // Info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
              <div style="padding: 10px;">
                <strong>${this.details.web_coupon_bname}</strong><br>
                ${this.address}<br>
                ${this.city}, ${this.state} ${this.postalcode}
              </div>
            `,
            });

            this.marker.addListener('click', () => {
              infoWindow.open(this.map, this.marker);
            });

            // Open info window by default
            infoWindow.open(this.map, this.marker);
          }
        }
      );
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /* view redeem button click alert */
  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Before View Redeem Options Enter your Email Address!',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email Address',
          value: this.emailredeem || '',
          attributes: {
            autocomplete: 'email',
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'OK',
          handler: async (data) => {
            await this.handleEmailSubmission(data.email);
            return false;
          },
        },
      ],
    });

    await alert.present();
  }

  async handleEmailSubmission(email: string) {
    if (!email || email.trim() === '') {
      this._commonService.presentToast('Please enter your email');
      return false;
    }

    if (!this._commonService.validateEmail(email)) {
      this._commonService.presentToast('Please enter a valid email');
      return false;
    }

    try {
      const loading = await this.loadingController.create({
        message: 'Processing...',
      });
      await loading.present();

      // Save email
      await Preferences.set({ key: 'userEmail', value: email });
      this.emailredeem = email;
      localStorage.setItem('redeemEmail', email);

      // Update email in database - using your original service call
      const data = { email: email, cid: this.cid };
      const Response = await this._detailsService.updateemail(data);

      await loading.dismiss();

      if (Response.status === '200') {
        this.viewredeem = true;
        // Add to email history
        await this.addToEmailHistory(email);
      } else {
        this._commonService.presentToast(
          Response.error || 'Failed to update email'
        );
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this._commonService.presentToast('Connection error');
    }

    return true;
  }

  async addToEmailHistory(email: string) {
    try {
      // Remove if already exists
      const index = this.emailHistory.indexOf(email);
      if (index > -1) {
        this.emailHistory.splice(index, 1);
      }

      // Add to beginning
      this.emailHistory.unshift(email);

      // Keep only last 10 emails
      if (this.emailHistory.length > 10) {
        this.emailHistory = this.emailHistory.slice(0, 10);
      }

      // Save to preferences
      await Preferences.set({
        key: 'emailHistory',
        value: JSON.stringify(this.emailHistory),
      });
    } catch (error) {
      console.error('Error saving email history:', error);
    }
  }

  /* print coupon button click alert */
  async printAlertPrompt() {
    let email = this.emailredeem || localStorage.getItem('redeemEmail');

    if (!email) {
      await this.presentAlertPrompt();
      return;
    }

    if (!this._commonService.validateEmail(email)) {
      this._commonService.presentToast('Please enter a valid email');
      return;
    }

    this.useremail = email;

    try {
      // Get stored coupon list
      const { value: cidList } = await Preferences.get({
        key: 'dc_CoupListId',
      });
      if (cidList) {
        this.overAllCidStr = this.cid + '|' + cidList;
      } else {
        this.overAllCidStr = this.cid;
      }

      // Prepare data
      const data = {
        email: email,
        cid: this.overAllCidStr,
      };

      // Get coupon HTML
      await this.getCoupSaved();
    } catch (error) {
      this._commonService.presentToast('Error occurred');
    }
  }

  printlistsave() {
    this.saveToPrintList();
  }

  async saveToPrintList() {
    try {
      const { value: existingList } = await Preferences.get({
        key: 'dc_CoupList',
      });
      const { value: existingIds } = await Preferences.get({
        key: 'dc_CoupListId',
      });

      const htmlStr = this.printhtml();

      if (existingIds) {
        const idList = existingIds.split('|');

        if (!idList.includes(this.cid)) {
          // Add new coupon
          const newIdList = idList.concat(this.cid).join('|');
          const newHtmlList = existingList
            ? `${existingList}||${htmlStr}`
            : htmlStr;

          await Preferences.set({ key: 'dc_CoupListId', value: newIdList });
          await Preferences.set({ key: 'dc_CoupList', value: newHtmlList });

          this._commonService.presentToast('Added to print list');
        } else {
          this._commonService.presentToast('Coupon already in print list');
        }
      } else {
        // First time saving
        await Preferences.set({ key: 'dc_CoupListId', value: this.cid });
        await Preferences.set({ key: 'dc_CoupList', value: htmlStr });

        this._commonService.presentToast('Added to print list');
      }
    } catch (error) {
      this._commonService.presentToast('Error occurred');
      console.error('Error saving to print list:', error);
    }
  }

  printhtml(): string {
    let url = '';
    let image = '';

    // Handle image
    if (this.imageAttach) {
      if (
        this.details.web_coupon_image &&
        this.details.web_coupon_image !== 'Not Available'
      ) {
        const encodedImage = encodeURIComponent(this.details.web_coupon_image);
        image = `<img src="https://www.dynamiccoupons.com/webupload/thumb/coupons/${encodedImage}" style="height: 100px; width: 100px;" alt="Coupon Image">`;
      } else if (this.details.image_type === 'img_link') {
        if (this.details.web_coupon_data_url) {
          image = `<img src="https://www.dynamiccoupons.com/webupload/couponimage/${this.details.web_coupon_data_url}" style="height: 100px; width: 100px;" alt="Coupon Image">`;
        } else {
          image = `<img src="${this.details.web_coupon_image_url}" style="height:100px; width:100px;" alt="Coupon Image">`;
        }
      } else {
        image = `<img src="https://www.dynamiccoupons.com/webupload/thumb/default/default9.png" height="150px" alt="Default Coupon Image">`;
      }
    }

    // Handle URL
    if (
      this.details.web_coupon_url &&
      this.details.web_coupon_url !== 'Not Available'
    ) {
      url = `<a title="To open, please copy/paste the web address in a new browser window." style="cursor:pointer;" target="_blank" href="${this.details.web_coupon_url}">${this.details.web_coupon_url}</a>`;
    }

    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.details.web_coupon_details || '';
    const textContent = tempDiv.textContent || '';

    // Create HTML for coupon
    return `
      <div class="couponbox" style="padding:10px;text-align:center;border:3px dashed #ccc;font-size:14px;width:300px;font-family:Arial;float:left;margin:32px">
        <div style="text-align:center;font-size:22px;font-weight:bold">${this.details.web_coupon_title}</div>
        <div>${image}</div>
        ${textContent}
        <div style="text-align:center;font-size:14px;font-weight:bold">Coupon ID: ${this.details.web_coupon_id}</div>
        <strong>Valid Up to:</strong> ${this.details.web_coupon_expiredate}<br>
        <strong>
          <div style="text-align:center;margin-top:7px;font-size:18px;font-weight:bold;font-family:Lobster;color:#6C6767">
            ${this.details.web_coupon_bname}
          </div>
        </strong>
        <strong>Address:</strong> ${this.details.web_coupon_address}, <br>
        ${this.details.web_coupon_city}, ${this.details.web_coupon_state}, ${this.details.web_coupon_postalcode}<br>
        ${this.details.web_coupon_country}<br>
        <strong>Website Address:</strong> ${url}
        <div>
          <img style="margin-top:20px;" src="${this.details.web_qrcode}" align="middle" alt="QR Code">
        </div>
      </div>
    `;
  }

  async getCoupSaved() {
    try {
      const { value: existingList } = await Preferences.get({
        key: 'dc_CoupList',
      });
      const htmlStr = this.printhtml();

      this.overAllHtmlStr = existingList ? existingList + htmlStr : htmlStr;

      await this.printpdf();
    } catch (error) {
      console.error('Error getting saved coupons:', error);
    }
  }

  async printpdf() {
    try {
      const loading = await this.loadingController.create({
        message: 'Sending email...',
      });
      await loading.present();

      // Prepare HTML
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Coupon Print</title>
          <style>
            .couponbox, #couponbox {
              padding: 10px;
              text-align: center;
              border: 3px dashed #ccc;
              font-size: 14px;
              width: 250px !important;
              float: left !important;
              margin: 32px !important;
            }
          </style>
        </head>
        <body>${this.overAllHtmlStr}</body>
        </html>
      `;

      // Get coupon IDs
      const { value: cids } = await Preferences.get({ key: 'dc_CoupListId' });

      // Prepare data for email
      const data = {
        email: this.useremail,
        econtent: fullHtml,
        cid: this.cid,
        cids: cids || '',
      };

      // Send email - using your original service call
      const Response = await this._detailsService.sendcoupontoemail(data);

      await loading.dismiss();

      if (Response.status === '200') {
        this._commonService.presentToast(
          Response.error || 'Email sent successfully'
        );

        // Clear stored coupons
        await Preferences.remove({ key: 'dc_CoupList' });
        await Preferences.remove({ key: 'dc_CoupListId' });

        // Reset view
        this.viewredeem = false;
        await this.initcontent();
      } else {
        this._commonService.presentToast(
          Response.error || 'Failed to send email'
        );
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this._commonService.presentToast('Connection error');
    }
  }

  // Browser methods using Capacitor
  async inappclick(link: any) {
    if (!link) return;

    try {
      await Browser.open({
        url: link,
        presentationStyle: 'popover',
      });
    } catch (error) {
      window.open(link, '_blank');
    }
  }

  async nextPage(id: any, type: any, circulation: any, link: any) {
    await this.inappclick(link);
  }

  // Share functionality
  async shareCoupon() {
    try {
      const shareUrl = `https://www.dynamiccoupons.com/coupon/${this.cid}`;

      await Share.share({
        title: this.details.web_coupon_title,
        text: `Check out this coupon: ${this.details.web_coupon_title}`,
        url: shareUrl,
        dialogTitle: 'Share Coupon',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  goBack() {
    this.navController.back();
  }

  // Alert methods - keeping your original structure
  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
    },
    {
      text: 'Ok',
      handler: async (e: any) => {
        await this.handleEmailSubmission(e.email);
        return false;
      },
    },
  ];

  private initializeAlertInputs() {
    this.alertInputs = [
      {
        type: 'email' as const,
        name: 'email',
        placeholder: 'Email Address',
        value: this.emailredeem || '',
        attributes: {
          autocorrect: 'on',
          required: true,
        },
        // Remove 'autocomplete' and 'list' - they don't exist in AlertInput type
      },
    ];
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Before View Redeem Options Enter your Email Address!',
      inputs: this.alertInputs,
      buttons: this.alertButtons,
    });
    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'my-toast-class',
    });
    await toast.present();
  }

  // Retry method for error state
  async retry() {
    await this.initLoad();
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
