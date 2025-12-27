import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Browser, OpenOptions } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { AdMobService } from '../providers/admob/admob';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly browserOptions: Partial<OpenOptions> = {
    toolbarColor: '#08b8da',
    presentationStyle: 'popover'
  };

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private platform: Platform,
    private adMobService: AdMobService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      // ✅ App is ready → hide splash
      await SplashScreen.hide();

      // ✅ Load ads AFTER splash is gone
      this.initializeAd();
    });
  }

  ngOnInit() {
    // ❌ DO NOT initialize AdMob here
  }

  async ngOnDestroy() {
    await this.adMobService.removeBannerAd();
  }

  async initializeAd() {
    try {
      setTimeout(async () => {
        await this.adMobService.showBannerAd();
      }, 500);
    } catch (error) {
      console.error('Failed to initialize ad:', error);
    }
  }

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }

  async openExternalLink(url: string) {
    this.closeMenu();
    await Browser.open({
      url,
      ...this.browserOptions
    });
  }
}
