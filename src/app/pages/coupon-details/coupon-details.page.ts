import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { 
  AlertController, 
  ModalController, 
  ToastController, 
  LoadingController,
  IonicModule
} from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { EmailComposer } from 'capacitor-email-composer';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import your services
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';

declare const google: any;

@Component({
  selector: 'app-coupondetails',
  templateUrl: './coupon-details.page.html',
  styleUrls: ['./coupon-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CouponDetailsPage implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  
  // Variables
  sanitizedHtml: SafeHtml;
  emailHistory: string[] = [];
  cid: any;
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
  
  // Loading state
  isLoading = true;
  mapInitialized = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _detailsService: DetailsService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml('');
  }

  ngOnInit() {
    this.initLoad();
  }

  async ngAfterViewInit() {
    // Initialize map after view is loaded
    await this.platform.ready();
    if (this.details.web_coupon_address) {
      setTimeout(() => this.initializeMap(), 500);
    }
  }

  async initLoad() {
    this.isLoading = true;
    
    // Get coupon ID from route parameters
    this.cid = this.route.snapshot.paramMap.get('cid');
    
    if (!this.cid) {
      this._commonService.presentToast('Invalid coupon ID');
      this.router.navigate(['/search']);
      return;
    }

    // Get stored email
    await this.loadUserEmail();
    
    // Load coupon details
    await this.initcontent();
    
    this.isLoading = false;
  }

  async loadUserEmail() {
    try {
      const { value } = await Preferences.get({ key: 'userEmail' });
      this.DCloginEmail = value;
      this.emailredeem = value;
    } catch (error) {
      console.error('Error loading user email:', error);
    }
    
    // Load email history
    await this.loadEmailHistory();
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
    try {
      const loading = await this.loadingController.create({
        message: 'Loading coupon details...'
      });
      await loading.present();

      const Response = await this._detailsService.getContent(this.cid);
      
      if (Response.status === "200") {
        this.details = Response.data;
        
        // Extract address details
        this.address = this.details.web_coupon_address;
        this.city = this.details.web_coupon_city;
        this.country = this.details.web_coupon_country;
        this.state = this.details.web_coupon_state;
        this.postalcode = this.details.web_coupon_postalcode;
        
        // Sanitize HTML content
        this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(
          this.details.web_coupon_details || ''
        );
        
        // Initialize map if address exists
        if (this.address && !this.mapInitialized) {
          await this.initializeMap();
          this.mapInitialized = true;
        }
        
      } else {
        this._commonService.presentToast(Response.error || 'Failed to load coupon');
      }
      
      await loading.dismiss();
      
    } catch (err) {
      await this.loadingController.dismiss();
      this._commonService.presentToast('Connection error');
      console.error('Error loading coupon:', err);
    }
  }

  async initializeMap() {
    if (!this.mapElement?.nativeElement || !this.address) return;
    
    try {
      // Initialize geocoder
      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${this.address}, ${this.city}, ${this.country}, ${this.state}, ${this.postalcode}`;
      
      geocoder.geocode({ 'address': fullAddress }, async (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const latitude = results[0].geometry.location.lat();
          const longitude = results[0].geometry.location.lng();
          const latlng = new google.maps.LatLng(latitude, longitude);
          
          // Map options
          const mapOptions = {
            center: latlng,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            gestureHandling: 'greedy',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true
          };
          
          // Create map
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
          
          // Create marker
          this.marker = new google.maps.Marker({
            position: latlng,
            map: this.map,
            title: this.details.web_coupon_bname,
            animation: google.maps.Animation.DROP
          });
          
          // Info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <strong>${this.details.web_coupon_bname}</strong><br>
                ${this.address}<br>
                ${this.city}, ${this.state} ${this.postalcode}
              </div>
            `
          });
          
          // Marker click event
          this.marker.addListener('click', () => {
            infoWindow.open(this.map, this.marker);
            
            // Open Google Maps
            this.openGoogleMaps(latitude, longitude);
          });
          
          // Open info window by default
          infoWindow.open(this.map, this.marker);
          
        } else {
          console.error('Geocode was not successful:', status);
        }
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async openGoogleMaps(lat: number, lng: number) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    try {
      await Browser.open({
        url: url,
        presentationStyle: 'popover'
      });
    } catch (error) {
      window.open(url, '_blank');
    }
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Enter Your Email',
      message: 'Please enter your email address to view redeem options',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email Address',
          value: this.emailredeem || '',
          attributes: {
            autocomplete: 'email'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'OK',
          handler: async (data) => {
            await this.handleEmailSubmission(data.email);
            return false; // Keep alert open if validation fails
          }
        }
      ]
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
        message: 'Processing...'
      });
      await loading.present();
      
      // Save email
      await Preferences.set({ key: 'userEmail', value: email });
      this.emailredeem = email;
      
      // Update email in database
      const data = { email: email, cid: this.cid };
      const Response = await this._detailsService.updateemail(data);
      
      await loading.dismiss();
      
      if (Response.status === "200") {
        this.viewredeem = true;
        // Add to email history
        await this.addToEmailHistory(email);
      } else {
        this._commonService.presentToast(Response.error || 'Failed to update email');
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
        value: JSON.stringify(this.emailHistory) 
      });
      
    } catch (error) {
      console.error('Error saving email history:', error);
    }
  }

  async printAlertPrompt() {
    const email = this.emailredeem;
    
    if (!email) {
      await this.presentAlertPrompt();
      return;
    }
    
    if (!this._commonService.validateEmail(email)) {
      this._commonService.presentToast('Please enter a valid email');
      return;
    }
    
    try {
      const loading = await this.loadingController.create({
        message: 'Preparing coupon...'
      });
      await loading.present();
      
      // Get stored coupon list
      const { value: cidList } = await Preferences.get({ key: 'dc_CoupListId' });
      if (cidList) {
        this.overAllCidStr = this.cid + "|" + cidList;
      } else {
        this.overAllCidStr = this.cid;
      }
      
      // Prepare data
      const data = {
        email: email,
        cid: this.overAllCidStr
      };
      
      // Get coupon HTML
      await this.getCoupSaved();
      
    } catch (error) {
      await this.loadingController.dismiss();
      this._commonService.presentToast('Error occurred');
    }
  }

  async printlistsave() {
    try {
      const { value: existingList } = await Preferences.get({ key: 'dc_CoupList' });
      const { value: existingIds } = await Preferences.get({ key: 'dc_CoupListId' });
      
      const htmlStr = this.printhtml();
      
      if (existingIds) {
        const idList = existingIds.split("|");
        
        if (!idList.includes(this.cid)) {
          // Add new coupon
          const newIdList = idList.concat(this.cid).join("|");
          const newHtmlList = existingList ? `${existingList}||${htmlStr}` : htmlStr;
          
          await Preferences.set({ key: 'dc_CoupListId', value: newIdList });
          await Preferences.set({ key: 'dc_CoupList', value: newHtmlList });
          
          this._commonService.presentToast("Added to print list");
        } else {
          this._commonService.presentToast("Coupon already in print list");
        }
      } else {
        // First time saving
        await Preferences.set({ key: 'dc_CoupListId', value: this.cid });
        await Preferences.set({ key: 'dc_CoupList', value: htmlStr });
        
        this._commonService.presentToast("Added to print list");
      }
      
    } catch (error) {
      this._commonService.presentToast("Error occurred");
      console.error('Error saving to print list:', error);
    }
  }

  printhtml(): string {
    let url = '';
    let image = '';
    
    // Handle image
    if (this.imageAttach) {
      if (this.details.web_coupon_image && this.details.web_coupon_image !== "Not Available") {
        const encodedImage = encodeURIComponent(this.details.web_coupon_image);
        image = `<img src="https://www.dynamiccoupons.com/webupload/thumb/coupons/${encodedImage}" style="height: 100px; width: 100px;" alt="Coupon Image">`;
      } else if (this.details.image_type === 'img_link' && this.details.web_coupon_image_url) {
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
    if (this.details.web_coupon_url && this.details.web_coupon_url !== "Not Available") {
      url = `<a title="Open in browser" style="cursor:pointer;" target="_blank" href="${this.details.web_coupon_url}">${this.details.web_coupon_url}</a>`;
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
      const { value: existingList } = await Preferences.get({ key: 'dc_CoupList' });
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
        message: 'Sending email...'
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
        cids: cids || ''
      };
      
      // Send email
      const Response = await this._detailsService.sendcoupontoemail(data);
      
      await loading.dismiss();
      
      if (Response.status === "200") {
        this._commonService.presentToast(Response.error || 'Email sent successfully');
        
        // Clear stored coupons
        await Preferences.remove({ key: 'dc_CoupList' });
        await Preferences.remove({ key: 'dc_CoupListId' });
        
        // Reset view
        this.viewredeem = false;
        await this.initcontent();
        
      } else {
        this._commonService.presentToast(Response.error || 'Failed to send email');
      }
      
    } catch (error) {
      await this.loadingController.dismiss();
      this._commonService.presentToast('Connection error');
    }
  }

  async inappclick(link: any) {
    if (!link) return;
    
    try {
      await Browser.open({
        url: link,
        presentationStyle: 'popover'
      });
    } catch (error) {
      window.open(link, '_blank');
    }
  }

  nextPage(id: any, type: any, circulation: any, link: any) {
    this.inappclick(link);
  }

  async shareCoupon() {
    try {
      const shareUrl = `https://www.dynamiccoupons.com/coupon/${this.cid}`;
      
      await Share.share({
        title: this.details.web_coupon_title,
        text: `Check out this coupon: ${this.details.web_coupon_title}`,
        url: shareUrl,
        dialogTitle: 'Share Coupon'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  async sendEmail() {
    try {
      const isAvailable = await EmailComposer.hasAccount();
      
      if (isAvailable) {
        await EmailComposer.open({
          to: [this.emailredeem],
          subject: `Coupon: ${this.details.web_coupon_title}`,
          body: `Here's your coupon: ${this.details.web_coupon_title}`,
          isHtml: true
        });
      } else {
        this._commonService.presentToast('No email account configured');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      this._commonService.presentToast('Failed to open email client');
    }
  }


  // Helper method to check if circulation has ended
  isCirculationEnded(): boolean {
    if (!this.details.web_coupon_circulation) return false;
    
    const { web_coupon_circulation, count_share, web_coupons_merchant_type } = this.details;
    
    if (web_coupons_merchant_type === '1' || web_coupons_merchant_type === '2') {
      return count_share >= web_coupon_circulation;
    }
    
    return false;
  }

  // Navigation
  goBack() {
    this.router.navigate(['/search']);
  }

  // Error handling
  async retry() {
    await this.initcontent();
  }
}