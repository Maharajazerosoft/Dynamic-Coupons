import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { 
  AdMob, 
  BannerAdOptions, 
  BannerAdPosition, 
  BannerAdSize 
} from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root'
})
export class AdMobService {
  private initialized = false;
  private bannerDisplayed = false;

  constructor(private platform: Platform) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing AdMob...');
      
      // Use testing only in development
      const isTesting = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
      
      await AdMob.initialize({
        initializeForTesting: isTesting,
      });
      
      this.initialized = true;
      console.log('AdMob initialized, testing mode:', isTesting);
    } catch (error) {
      console.error('AdMob init error:', error);
    }
  }

  async showBannerAd(): Promise<void> {
    if (this.bannerDisplayed) {
      console.log('Banner already displayed');
      return;
    }
    
    try {
      await this.initialize();
      
      // Use test ID in development, real ID in production
      const adId = this.isTestEnvironment() 
        ? 'ca-app-pub-3940256099942544/6300978111' // Test ID
        : 'YOUR_REAL_BANNER_AD_ID'; // Replace with real ID
      
      const options: BannerAdOptions = {
        adId: adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER, // Better than fixed BANNER
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0, // We'll handle positioning in CSS
        isTesting: this.isTestEnvironment(),
        // npa: true // Uncomment for non-personalized ads if needed
      };
      
      console.log('Showing banner ad...');
      await AdMob.showBanner(options);
      this.bannerDisplayed = true;
      console.log('Banner ad shown successfully');
      
    } catch (error) {
      console.error('Failed to show banner:', error);
      throw error;
    }
  }

  async hideBannerAd(): Promise<void> {
    if (!this.bannerDisplayed) return;
    
    try {
      await AdMob.hideBanner();
      console.log('Banner hidden');
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  }

  async removeBannerAd(): Promise<void> {
    try {
      await AdMob.removeBanner();
      this.bannerDisplayed = false;
      console.log('Banner removed');
    } catch (error) {
      console.error('Failed to remove banner:', error);
    }
  }

  async resumeBannerAd(): Promise<void> {
    if (this.bannerDisplayed) {
      try {
        await AdMob.resumeBanner();
        console.log('Banner resumed');
      } catch (error) {
        console.error('Failed to resume banner:', error);
      }
    }
  }

  private isTestEnvironment(): boolean {
    // Check if we're in development
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('ionic');
  }

  // Optional: Add interstitial ad support
  async showInterstitialAd(): Promise<void> {
    try {
      await this.initialize();
      
      const adId = this.isTestEnvironment()
        ? 'ca-app-pub-3940256099942544/1033173712' // Test interstitial ID
        : 'YOUR_REAL_INTERSTITIAL_AD_ID';
      
      await AdMob.prepareInterstitial({
        adId: adId,
        isTesting: this.isTestEnvironment(),
      });
      
      await AdMob.showInterstitial();
    } catch (error) {
      console.error('Failed to show interstitial:', error);
    }
  }
}