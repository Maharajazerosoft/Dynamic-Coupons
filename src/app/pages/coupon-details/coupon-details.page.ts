import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
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
import { isPlatformBrowser } from '@angular/common';

// Type for performance navigation
interface PerformanceNavigationTiming extends PerformanceEntry {
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

// Google Maps declaration
declare const google: any;

// Import your services
import { CommonService } from '../../../providers/common/common.service';
import { DetailsService } from '../../../providers/details/details.service';

// Declare google as global
@Component({
  selector: 'app-coupon-details',
  templateUrl: './coupon-details.page.html',
  styleUrls: ['./coupon-details.page.scss'],
  standalone: false,
})
export class CouponDetailsPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  cid: any;

  // Variables
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
  state: any;
  postalcode: any;
  map: any;
  marker: any;
  infoWindow: any;

  // New variables
  isLoading = false;
  error: string | null = null;
  name: string | undefined;
  isGoogleMapsLoaded = false;
  isMapInitialized = false;

  public alertInputs: AlertInput[] = [
    {
      type: 'email',
      name: 'email',
      placeholder: 'Email Address',
      attributes: {
        autocorrect: 'on',
        required: true,
      },
    },
  ];

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
    },
    {
      text: 'Ok',
      handler: async (e: any) => {
       const result = await this.handleEmailSubmission(e.email);
       console.log('[ALERT RESULT]', result);
  return result;

      },
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
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

  async ngOnInit() {
    console.log('🔄 Initializing CouponDetailsPage...');

    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      console.log('⚠️ Not in browser environment, skipping map initialization');
      return;
    }

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
    // Map will be initialized after data loads
  }

  ngOnDestroy() {
    this.cleanupMap();
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

        // Set address variables from API response
        this.address = this.details.web_coupon_address;
        this.city = this.details.web_coupon_city;
        this.country = this.details.web_coupon_country;
        this.state = this.details.web_coupon_state;
        this.postalcode = this.details.web_coupon_postalcode;

        // Process the data
        if (this.details.web_coupon_details) {
          this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.details.web_coupon_details
          );
        }

        // Initialize map if address exists
        if (this.address && this.address.trim() !== '') {
          // Use setTimeout to ensure the view is rendered
          setTimeout(() => {
            this.loadAndInitializeMap();
          }, 500);
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

  async loadAndInitializeMap() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.mapElement?.nativeElement) {
      console.error('❌ Map element not found');
      return;
    }

    if (!this.address || this.address.trim() === '') {
      console.log('⚠️ No address available for map');
      return;
    }

    try {
      // Load Google Maps API
      await this.loadGoogleMaps();

      // Initialize the map
      this.initializeMap();
    } catch (error) {
      console.error('❌ Error loading/initializing map:', error);
    }
  }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps) {
        console.log('✅ Google Maps already loaded');
        this.isGoogleMapsLoaded = true;
        resolve();
        return;
      }

      // Check if script is already loading or loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        console.log('✅ Google Maps script already exists');

        // Check if Google Maps is loaded with timeout
        const checkInterval = 100;
        const timeout = 10000;
        const startTime = Date.now();

        const checkLoaded = () => {
          if (typeof google !== 'undefined' && google.maps) {
            console.log('✅ Google Maps loaded successfully');
            this.isGoogleMapsLoaded = true;
            resolve();
          } else if (Date.now() - startTime > timeout) {
            console.error('❌ Google Maps failed to load within timeout');
            reject(new Error('Google Maps loading timeout'));
          } else {
            setTimeout(checkLoaded, checkInterval);
          }
        };

        checkLoaded();
        return;
      }

      // Load Google Maps script
      console.log('📡 Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDflqPuXRlq_r7kbtfQtM_Jb4BxjflJcdE&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Maps script loaded');
        // Wait a bit for the API to initialize
        setTimeout(() => {
          if (typeof google !== 'undefined' && google.maps) {
            console.log('✅ Google Maps API loaded successfully');
            this.isGoogleMapsLoaded = true;
            resolve();
          } else {
            console.error('❌ Google Maps API not available after script load');
            reject(new Error('Google Maps API not available'));
          }
        }, 500);
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Google Maps script:', error);
        reject(new Error('Failed to load Google Maps'));
      };

      document.head.appendChild(script);
    });
  }

  initializeMap() {
    if (!this.isGoogleMapsLoaded || typeof google === 'undefined') {
      console.error('❌ Google Maps not loaded');
      return;
    }

    if (!this.mapElement?.nativeElement) {
      console.error('❌ Map element not found');
      return;
    }

    // Clean up existing map
    this.cleanupMap();

    console.log('🗺️ Initializing Google Map...');

    try {
      // Build address string for geocoding
      const addressParts = [
        this.address,
        this.city,
        this.state,
        this.postalcode,
        this.country,
      ].filter((part) => part && part.trim() !== '');

      const fullAddress = addressParts.join(', ');
      console.log('📍 Geocoding address:', fullAddress);

      // Create geocoder
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        { address: fullAddress },
        (results: any, status: any) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results.length > 0
          ) {
            console.log('✅ Geocoding successful');

            const location = results[0].geometry.location;
            const latLng = new google.maps.LatLng(
              location.lat(),
              location.lng()
            );

            // Create map options with better defaults
            const mapOptions = {
              center: latLng,
              zoom: 12, // Reduced from 15 for better overview
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: [
                  google.maps.MapTypeId.ROADMAP,
                  google.maps.MapTypeId.SATELLITE,
                  google.maps.MapTypeId.HYBRID,
                ],
              },
              scaleControl: true,
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
              rotateControl: false,
              fullscreenControl: true,
              fullscreenControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
              },
              styles: [
                {
                  featureType: 'poi.business',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }], // Changed to 'on' to show business labels
                },
                {
                  featureType: 'water',
                  elementType: 'geometry',
                  stylers: [{ color: '#e9e9e9' }],
                },
                {
                  featureType: 'landscape',
                  elementType: 'geometry',
                  stylers: [{ color: '#f5f5f5' }],
                },
              ],
              gestureHandling: 'greedy', // Better touch handling
            };

            // Create the map
            this.map = new google.maps.Map(
              this.mapElement.nativeElement,
              mapOptions
            );

            // Create marker
            this.marker = new google.maps.Marker({
              position: latLng,
              map: this.map,
              title: this.details.web_coupon_bname || 'Business Location',
              animation: google.maps.Animation.DROP,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Changed to red for better visibility
                scaledSize: new google.maps.Size(40, 40),
              },
              optimized: false, // Better for performance
            });

            // Create info window content
            const infoContent = `
          <div style="padding: 15px; font-family: Arial, sans-serif; max-width: 250px; line-height: 1.4;">
            <h3 style="margin: 0 0 10px 0; color: #08b8da; font-size: 16px; font-weight: bold;">
              ${this.details.web_coupon_bname || 'Business'}
            </h3>
            <div style="margin-bottom: 10px;">
              <p style="margin: 5px 0; font-size: 14px; color: #333;">
                <strong>Address:</strong><br>
                ${this.address || ''}
                ${this.city ? `<br>${this.city}` : ''}
                ${this.state ? `, ${this.state}` : ''}
                ${this.postalcode ? ` ${this.postalcode}` : ''}
                ${this.country ? `<br>${this.country}` : ''}
              </p>
            </div>
            ${
              this.details.web_coupon_phone
                ? `<div style="margin: 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Phone:</strong> ${this.details.web_coupon_phone}
                </p>
              </div>`
                : ''
            }
            <div style="margin-top: 12px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                fullAddress
              )}" 
                 target="_blank" 
                 style="background: #08b8da; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block; transition: background 0.3s;"
                 onmouseover="this.style.background='#07a8c9'" 
                 onmouseout="this.style.background='#08b8da'">
                Get Directions
              </a>
            </div>
          </div>
        `;

            // Create info window
            this.infoWindow = new google.maps.InfoWindow({
              content: infoContent,
              maxWidth: 280,
              pixelOffset: new google.maps.Size(0, -40),
            });

            // Add click listener to marker
            this.marker.addListener('click', () => {
              this.infoWindow.open(this.map, this.marker);
            });

            // Add click listener to map to close info window
            this.map.addListener('click', () => {
              this.infoWindow.close();
            });

            // Open info window by default with delay
            setTimeout(() => {
              this.infoWindow.open(this.map, this.marker);
            }, 500);

            // Set a minimum zoom level and adjust bounds
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(latLng);

            // Expand bounds slightly for better view
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const latDiff = Math.abs(ne.lat() - sw.lat());
            const lngDiff = Math.abs(ne.lng() - sw.lng());

            // Expand bounds to ensure proper zoom
            bounds.extend(
              new google.maps.LatLng(
                ne.lat() + latDiff * 0.05,
                ne.lng() + lngDiff * 0.05
              )
            );
            bounds.extend(
              new google.maps.LatLng(
                sw.lat() - latDiff * 0.05,
                sw.lng() - lngDiff * 0.05
              )
            );

            // Fit bounds with padding
            this.map.fitBounds(bounds, {
              padding: { top: 50, right: 50, bottom: 50, left: 50 },
            });

            // Set minimum zoom after fitting bounds
            this.map.addListener('bounds_changed', () => {
              const currentZoom = this.map.getZoom();
              if (currentZoom > 16) {
                this.map.setZoom(16); // Maximum zoom
              } else if (currentZoom < 10) {
                this.map.setZoom(10); // Minimum zoom for better view
              }
            });

            // Listen for map type changes
            this.map.addListener('maptypeid_changed', () => {
              console.log('Map type changed to:', this.map.getMapTypeId());
            });

            this.isMapInitialized = true;
            console.log('✅ Map initialized successfully');
          } else {
            console.error('❌ Geocoding failed with status:', status);
            this.showDefaultMap();
          }
        }
      );
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      this.showDefaultMap();
    }
  }

  showDefaultMap() {
    if (!this.isGoogleMapsLoaded || typeof google === 'undefined') {
      console.error('❌ Google Maps not available for default map');
      return;
    }

    if (!this.mapElement?.nativeElement) {
      return;
    }

    try {
      // Default location (center of the US)
      const defaultLatLng = new google.maps.LatLng(39.8283, -98.5795);

      const mapOptions = {
        center: defaultLatLng,
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID,
          ],
        },
        streetViewControl: true,
        fullscreenControl: true,
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Show message marker
      const marker = new google.maps.Marker({
        position: defaultLatLng,
        map: this.map,
        title: 'Location Not Found',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        },
      });

      // Show info window
      this.infoWindow = new google.maps.InfoWindow({
        content: `
        <div style="padding: 15px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            <strong>Location Not Found</strong>
          </p>
          <p style="margin: 0; color: #999; font-size: 13px;">
            Unable to display map for the provided address.
          </p>
        </div>
      `,
        position: defaultLatLng,
      });

      this.infoWindow.open(this.map);

      // Add click listener to marker
      marker.addListener('click', () => {
        this.infoWindow.open(this.map, marker);
      });

      this.isMapInitialized = true;
      console.log('⚠️ Default map displayed');
    } catch (error) {
      console.error('❌ Error showing default map:', error);
    }
  }

  cleanupMap() {
    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = null;
    }

    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }

    if (this.map) {
      // Clear all event listeners
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }

    this.isMapInitialized = false;
    console.log('🗺️ Map cleaned up');
  }

  // Custom toast method - overrides common service
  async showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,  // Change this for duration (3000 = 3 seconds)
      position: 'top',
      cssClass: type === 'error' ? 'error-toast-class' : 'success-toast-class',
    });
    await toast.present();
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
            const result = await this.handleEmailSubmission(data.email);
            console.log('[ALERT RESULT]', result);
            return result;
          },
        },
      ],
    });

    await alert.present();
  }

  async handleEmailSubmission(email: string) {
    if (!email || email.trim() === '') {
      this.showToast('Please enter your email', 'error');
      return false;
    }

    if (!this._commonService.validateEmail(email)) {
      this.showToast('Please enter a valid email', 'error');
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

      // Update email in database
      const data = { email: email, cid: this.cid };
      const Response = await this._detailsService.updateemail(data);

      await loading.dismiss();

      if (Response.status === '200') {
        this.viewredeem = true;
        // Add to email history
        await this.addToEmailHistory(email);
      } else {
        this.showToast(Response.error || 'Failed to update email', 'error');
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this.showToast('Connection error', 'error');
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
      this.showToast('Please enter a valid email', 'error');
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
      this.showToast('Error occurred', 'error');
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
      const { value: existingImageFlags } = await Preferences.get({
        key: 'dc_CoupListImageFlags',
      });

      const htmlStr = this.printhtml(this.imageAttach);
      const imageFlag = this.imageAttach ? '1' : '0';

      if (existingIds) {
        const idList = existingIds.split('|');

        if (!idList.includes(this.cid)) {
          // Add new coupon
          const newIdList = idList.concat(this.cid).join('|');
          const newHtmlList = existingList
            ? `${existingList}||${htmlStr}`
            : htmlStr;
          const newImageFlags = existingImageFlags 
            ? `${existingImageFlags}|${imageFlag}` 
            : imageFlag;

          await Preferences.set({ key: 'dc_CoupListId', value: newIdList });
          await Preferences.set({ key: 'dc_CoupList', value: newHtmlList });
          await Preferences.set({ key: 'dc_CoupListImageFlags', value: newImageFlags });

          this.showToast('Added to print list', 'success');
        } else {
          this.showToast('Coupon already in print list', 'error');
        }
      } else {
        // First time saving
        await Preferences.set({ key: 'dc_CoupListId', value: this.cid });
        await Preferences.set({ key: 'dc_CoupList', value: htmlStr });
        await Preferences.set({ key: 'dc_CoupListImageFlags', value: imageFlag });

        this.showToast('Added to print list', 'success');
      }
    } catch (error) {
      this.showToast('Error occurred', 'error');
      console.error('Error saving to print list:', error);
    }
  }

  printhtml(includeImage: boolean = this.imageAttach): string {
    let url = '';
    let image = '';

    // Handle image
    if (includeImage) {
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
      const htmlStr = this.printhtml(this.imageAttach);

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

      // Send email
      const Response = await this._detailsService.sendcoupontoemail(data);

      await loading.dismiss();

      if (Response.status === '200') {
        this.showToast(Response.error || 'Email sent successfully', 'success');

        // Clear stored coupons
        await Preferences.remove({ key: 'dc_CoupList' });
        await Preferences.remove({ key: 'dc_CoupListId' });
        await Preferences.remove({ key: 'dc_CoupListImageFlags' });

        // Reset view
        this.viewredeem = false;
        await this.initcontent();
      } else {
        this.showToast(Response.error || 'Failed to send email', 'error');
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this.showToast('Connection error', 'error');
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
      duration: 3000,
      position: 'top',
      cssClass: 'my-toast-class',
    });
    await toast.present();
  }

  // Retry method for error state
  async retry() {
    await this.initLoad();
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
  
  goBackArrow() {
    this.navController.back();
  }
}
