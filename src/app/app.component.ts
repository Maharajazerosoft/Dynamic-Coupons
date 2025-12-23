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

  // Open external links
  async openExternalLink(url: string) {
    this.closeMenu();
    await Browser.open({
      url: url,
      ...this.browserOptions
    });
  }
}