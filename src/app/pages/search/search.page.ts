import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { MenuController, NavController } from "@ionic/angular";
import { environment } from "../../../environments/environment";
import { AdMobService } from "../../../providers/admob/admob";
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: "search-page",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: false
})
export class SearchPage implements OnInit {

  private keyboardShowListener: any;
  private keyboardHideListener: any;
  submitted: boolean = true;
  resultStatus: any;
  showButton: boolean = true;
  searchValue: string = "";
  val: string = "";
  adStatus: string = "Loading...";
  environment = environment;


hideFakeCaret: boolean = false;


  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private adMobService: AdMobService,
    private platform: Platform,
    private navController: NavController
  ) {}

  openMenu() {
    this.menuCtrl.open("main-menu");
  }

  goBack() {
    this.router.navigate(["/"]);
  }

  async ngOnInit() {
    await this.loadAd();
    this.listenKeyboardEvents();
  }

  async ngOnDestroy() {
    await this.adMobService.removeBannerAd();

    // Remove keyboard listeners
    if (this.keyboardShowListener) {
      this.keyboardShowListener.remove();
    }
    if (this.keyboardHideListener) {
      this.keyboardHideListener.remove();
    }
  }

  listenKeyboardEvents() {

    this.keyboardShowListener = Keyboard.addListener('keyboardDidShow', async () => {
      console.log('Keyboard opened');
  
      // Remove banner
      await this.adMobService.removeBannerAd();
  
      // Remove white space
      document.documentElement.style.setProperty('--admob-space', '0px');
    });
  
    this.keyboardHideListener = Keyboard.addListener('keyboardDidHide', async () => {
      console.log('Keyboard closed');
  
      // Show banner again
      await this.adMobService.showBannerAd();
  
      // Restore white space
      document.documentElement.style.setProperty('--admob-space', '60px');
    });
  }
  

  async loadAd() {
    try {
      this.adStatus = "Loading banner ad...";
      console.log(this.adStatus);

      await this.adMobService.showBannerAd();

      this.adStatus = "Ad loaded";
      console.log("Ad loaded successfully");
    } catch (error: any) {
      this.adStatus = "Ad error: " + (error.message || "Unknown error");
      console.error("Ad error:", error);
    }
  }

  async testAd() {
    console.log("Testing ad...");
    this.adStatus = "Testing...";

    try {
      await this.adMobService.showBannerAd();
      this.adStatus = "Test passed";
    } catch (error) {
      this.adStatus = "Test failed";
      console.error("Ad test failed:", error);
    }
  }

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  inappclick(link: string) {
    window.open(link, "_blank");
  }

 
  getItems(ev: any) {
    this.val = ev.target.value;
    this.searchValue = ev.target.value;
    this.hideFakeCaret = !!this.searchValue;
  }

  
  // searchResult(searchValue: string) {
  //   if (searchValue) {
  //     this.openSearchResultModal(searchValue);
  //   }
  // }
  goBackArrow() {
    this.navController.back();
  }
  
  searchResult(searchValue: string) {
    if (searchValue) {
      this.router.navigate(['/search-result'], {
        queryParams: { search: searchValue }
      });
    }
  }

  // Navigate to coupon page with type parameter
  nextLocalPage() {
    this.router.navigate(['/coupon', 'local']);
  }

  nextNationalPage() {
    this.router.navigate(['/coupon', 'national']);
  }
}
