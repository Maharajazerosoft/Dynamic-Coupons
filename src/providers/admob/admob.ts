import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { 
  AdMob, 
  BannerAdOptions, 
  BannerAdPosition, 
  BannerAdSize,
  AdMobInitializationOptions 
} from '@capacitor-community/admob';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdMobService {
  private isInitialized = false;

  constructor(private platform: Platform) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const options: AdMobInitializationOptions = {
      };

      await AdMob.initialize(options);
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }

  async showBannerAd(): Promise<void> {
    await this.initialize();

    try {
      const bannerId = environment.production 
        ? environment.admob.bannerId 
        : 'ca-app-pub-3940256099942544/6300978111'; // Test ID for development

      const options: BannerAdOptions = {
        adId: bannerId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !environment.production,
      };

      await AdMob.showBanner(options);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Error showing banner ad:', error);
    }
  }

  async hideBannerAd(): Promise<void> {
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Error hiding banner ad:', error);
    }
  }

  async removeBannerAd(): Promise<void> {
    try {
      await AdMob.removeBanner();
      console.log('Banner ad removed');
    } catch (error) {
      console.error('Error removing banner ad:', error);
    }
  }

  async showInterstitialAd(): Promise<void> {
    await this.initialize();

    try {
      const interstitialId = environment.production
        ? environment.admob.interstitialId
        : 'ca-app-pub-3940256099942544/1033173712'; // Test ID for development

      await AdMob.prepareInterstitial({
        adId: interstitialId,
        isTesting: !environment.production,
      });
      
      await AdMob.showInterstitial();
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
    }
  }

}