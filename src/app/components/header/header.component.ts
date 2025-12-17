import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { Browser, OpenOptions } from '@capacitor/browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HeaderComponent implements OnInit {
  @ViewChild('menu') menu: any;
  
  @Input() title: string = '';
  @Input() showLogo: boolean = true;
  @Input() showMenuButton: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() logoPath: string = 'assets/icon/logo.png';
  @Input() headerColor: string = '#08b8da';
  @Input() menuPosition: 'start' | 'end' = 'end';
  @Input() transparentHeader: boolean = false;
  
  @Output() backClicked = new EventEmitter<void>();
  @Output() menuItemClicked = new EventEmitter<string>();
  @Output() menuOpened = new EventEmitter<void>();
  @Output() menuClosed = new EventEmitter<void>();
  
  isMenuOpen = false;
  
  // Define browser options once
  private readonly browserOptions: Partial<OpenOptions> = {
    toolbarColor: '#08b8da',
    presentationStyle: 'popover'
  };

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.logoPath = this.logoPath || 'assets/icon/logo.png';
  }

  async goBack() {
    if (this.backClicked.observers.length > 0) {
      this.backClicked.emit();
    } else {
      this.navCtrl.back();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.menu) {
      if (this.isMenuOpen) {
        this.menu.open();
      } else {
        this.menu.close();
      }
    }
  }

  onMenuWillOpen() {
    this.isMenuOpen = true;
    this.menuOpened.emit();
  }

  onMenuWillClose() {
    this.isMenuOpen = false;
    this.menuClosed.emit();
  }

  async handleMenuItemClick(type: string) {
    this.toggleMenu(); // Close menu when item is clicked
    
    // Add a small delay to ensure menu closes before navigation
    setTimeout(async () => {
      if (this.menuItemClicked.observers.length > 0) {
        this.menuItemClicked.emit(type);
      } else {
        await this.navigateToPage(type);
      }
    }, 200);
  }

  private async navigateToPage(type: string) {
    switch(type) {
      case 'search':
        await this.navCtrl.navigateForward('/search');
        break;
      case 'local':
        await this.navCtrl.navigateForward('/coupons/local');
        break;
      case 'national':
        await this.navCtrl.navigateForward('/coupons/national');
        break;
      case 'privacy':
        await this.navCtrl.navigateForward('/privacy');
        break;
      case 'fundraise':
        await Browser.open({
          url: 'https://www.dynamiccoupons.com/donation_index.php',
          ...this.browserOptions
        });
        break;
      case 'faq':
        await Browser.open({
          url: 'https://www.dynamiccoupons.com/faq.php',
          ...this.browserOptions
        });
        break;
      case 'contact':
        await this.navCtrl.navigateForward('/contact');
        break;
      default:
        console.warn('Unknown menu item:', type);
    }
  }

  async openWebsite() {
    await Browser.open({
      url: 'https://www.dynamiccoupons.com',
      ...this.browserOptions
    });
  }

  getHeaderStyle() {
    return {
      'background': this.transparentHeader ? 'transparent' : this.headerColor,
      '--background': this.transparentHeader ? 'transparent' : this.headerColor
    };
  }
}