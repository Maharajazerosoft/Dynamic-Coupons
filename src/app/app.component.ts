import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Browser, OpenOptions } from '@capacitor/browser';
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
    private adMobService: AdMobService // Add AdMobService
  ) {}

  async ngOnInit() {
    // Initialize and show banner ad when app starts
    await this.initializeAd();
  }

  async ngOnDestroy() {
    // Clean up banner ad when app closes
    await this.adMobService.removeBannerAd();
  }

  async initializeAd() {
    try {
      // Wait a bit for the app to fully initialize
      setTimeout(async () => {
        await this.adMobService.showBannerAd();
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize ad:', error);
    }
  }

  // Close menu
  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  // Toggle menu
  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }

  // Open external links
  async openExternalLink(url: string) {
    this.closeMenu();
    await Browser.open({
      url: url,
      ...this.browserOptions
    });
  }
}