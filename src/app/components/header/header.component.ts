import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Browser, OpenOptions } from '@capacitor/browser';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.logoPath = this.logoPath || 'assets/icon/logo.png';
  }

  goBack() {
    if (this.backClicked.observers.length > 0) {
      this.backClicked.emit();
    } else {
      window.history.back();
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

  handleMenuItemClick(type: string) {
    this.toggleMenu(); // Close menu when item is clicked
    
    // Add a small delay to ensure menu closes before navigation
    setTimeout(() => {
      if (this.menuItemClicked.observers.length > 0) {
        this.menuItemClicked.emit(type);
      } else {
        this.navigateToPage(type);
      }
    });
  }

  private navigateToPage(type: string) {
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
        this.router.navigateByUrl('/privacy');
        break;
      case 'fundraise':
        Browser.open({
          url: 'https://www.dynamiccoupons.com/donation_index.php',
          ...this.browserOptions
        });
        break;
      case 'faq':
        Browser.open({
          url: 'https://www.dynamiccoupons.com/faq.php',
          ...this.browserOptions
        });
        break;
      case 'contact':
        this.router.navigateByUrl('/contact');
        break;
      default:
        console.warn('Unknown menu item:', type);
    }
  }

  openWebsite() {
    Browser.open({
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