import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { MenuController, NavController } from "@ionic/angular";
import { environment } from "../../../environments/environment";
import { AdMobService } from "../../../providers/admob/admob";

@Component({
  selector: "search-page",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: false
})
export class SearchPage implements OnInit {
  submitted: boolean = true;
  resultStatus: any;
  showButton: boolean = true;
  searchValue: string = "";
  val: string = "";
  adStatus: string = "Loading...";
  environment = environment;

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
  }

  async ngOnDestroy() {
    await this.adMobService.removeBannerAd();
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
