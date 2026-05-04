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
      
      await AdMob.initialize({
        initializeForTesting: false,
      });
      
      this.initialized = true;
      console.log('AdMob initialized');
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
      
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-8416006941552663/1243472245',
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
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

  async showInterstitialAd(): Promise<void> {
    try {
      await this.initialize();
      
      await AdMob.prepareInterstitial({
        adId: 'ca-app-pub-8416006941552663/8855165117',
        isTesting: false,
      });
      
      await AdMob.showInterstitial();
    } catch (error) {
      console.error('Failed to show interstitial:', error);
    }
  }
}
