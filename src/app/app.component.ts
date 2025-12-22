import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Browser, OpenOptions } from '@capacitor/browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false,
})
export class AppComponent {
  private readonly browserOptions: Partial<OpenOptions> = {
    toolbarColor: '#08b8da',
    presentationStyle: 'popover'
  };

  constructor(
    private menuCtrl: MenuController,
    private router: Router
  ) {}

  // Close menu
  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  // Toggle menu
  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }

  // Navigate to internal pages
  navigateTo(type: string) {
    this.closeMenu();
    
    // Add small delay for menu close animation
    setTimeout(() => {
      switch(type) {
        case 'search':
          this.router.navigate(['/search']);
          break;
        case 'local':
          this.router.navigate(['/coupons/local']);
          break;
        case 'national':
          this.router.navigate(['/coupons/national']);
          break;
        case 'privacy':
          this.router.navigate(['/privacy']);
          break;
        case 'contact':
          this.router.navigate(['/contact']);
          break;
        default:
          console.warn('Unknown menu item:', type);
      }
    }, 100);
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