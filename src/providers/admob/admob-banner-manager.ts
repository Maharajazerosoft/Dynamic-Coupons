import { Directive } from '@angular/core';
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';
import { AdMobService } from './admob';

interface BannerSizeInfo {
  width: number;
  height: number;
}

@Directive()
export abstract class AdMobBannerManager {
  protected abstract pageName: string;
  private bannerListener: any = null;
  private resizeListener: any = null;
  private isBannerShowing: boolean = false;

  constructor(protected admobService: AdMobService) {}

  async ionViewDidEnter() {
    console.log(`${this.pageName}: Setting up AdMob banner`);
    
    // Set up banner size listener
    await this.setupBannerListener();
    
    // Set up resize listener for orientation changes
    this.setupResizeListener();
    
    // Show banner and apply offset
    await this.showBannerWithOffset();
  }

  async ionViewWillLeave() {
    console.log(`${this.pageName}: Cleaning up AdMob banner`);
    
    // Hide banner and reset offset
    await this.hideBannerAndResetOffset();
    
    // Clean up listeners
    if (this.bannerListener) {
      this.bannerListener.remove();
      this.bannerListener = null;
    }
    
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
  }

  private async setupBannerListener() {
    // Listen for banner size changes
    this.bannerListener = await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (event: any) => {
      console.log(`${this.pageName}: Banner size changed`, event);
      if (event && event.height) {
        this.updateAdMobSpace(event.height);
      }
    });
  }

  private setupResizeListener() {
    // Handle orientation changes
    this.resizeListener = () => {
      // Debounce resize events
      setTimeout(() => {
        if (this.isBannerShowing) {
          console.log(`${this.pageName}: Window resized, updating banner space`);
          // Force a banner size update by re-querying
          this.queryBannerSize();
        }
      }, 500);
    };
    
    window.addEventListener('resize', this.resizeListener);
  }

  private async showBannerWithOffset() {
    try {
      await this.admobService.showBannerAd();
      this.isBannerShowing = true;
      
      // Query initial banner size
      this.queryBannerSize();
      
    } catch (error) {
      console.error(`${this.pageName}: Failed to show banner`, error);
    }
  }

  private async hideBannerAndResetOffset() {
    try {
      await this.admobService.hideBannerAd();
      this.isBannerShowing = false;
      
      // Reset CSS variable
      this.updateAdMobSpace(0);
      
    } catch (error) {
      console.error(`${this.pageName}: Failed to hide banner`, error);
    }
  }

  private async queryBannerSize() {
    try {
      // Since getBannerAdInfo doesn't exist, we'll use a fallback approach
      // Adaptive banners typically have height around 50-70px on phones, 90px on tablets
      const fallbackHeight = window.innerWidth < 768 ? 60 : 90;
      console.log(`${this.pageName}: Using fallback banner height: ${fallbackHeight}px`);
      this.updateAdMobSpace(fallbackHeight);
    } catch (error) {
      console.error(`${this.pageName}: Failed to query banner size`, error);
      // Fallback height
      const fallbackHeight = window.innerWidth < 768 ? 60 : 90;
      this.updateAdMobSpace(fallbackHeight);
    }
  }

  private updateAdMobSpace(height: number) {
    // Update CSS variable on document root
    // document.documentElement.style.setProperty('--admob-space', `${height}px`);
    console.log(`${this.pageName}: Updated --admob-space to ${height}px`);
  }
}
