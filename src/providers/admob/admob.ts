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

  constructor(private platform: Platform) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing AdMob...');
      await AdMob.initialize({
        initializeForTesting: true, // Always test for now
      });
      this.initialized = true;
      console.log('AdMob initialized');
    } catch (error) {
      console.error('AdMob init error:', error);
    }
  }

  async showBannerAd(): Promise<void> {
    try {
      await this.initialize();
      
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-3940256099942544/6300978111', // Google test ID
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 60,
        isTesting: true,
      };
      
      console.log('Showing banner ad...');
      await AdMob.showBanner(options);
      console.log('Banner ad shown');
      
    } catch (error) {
      console.error('Failed to show banner:', error);
      throw error;
    }
  }

  async removeBannerAd(): Promise<void> {
    try {
      await AdMob.removeBanner();
      console.log('Banner removed');
    } catch (error) {
      console.error('Failed to remove banner:', error);
    }
  }
}