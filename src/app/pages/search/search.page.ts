import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { IonicModule, ModalController, NavController, Platform } from "@ionic/angular";
import { MenuController } from "@ionic/angular";
import { environment } from "../../../environments/environment";
import { AdMobService } from "../../../providers/admob/admob";
import { CouponPage } from "../coupon/coupon.page";
import { SearchResultPage } from "../search-result/search-result.page";

@Component({
  selector: "search-page",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
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
    private modalController: ModalController,
    private router: Router,
    private adMobService: AdMobService,
    private platform: Platform,
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

  searchResult(searchValue: string) {
    if (searchValue) {
      this.openSearchResultModal(searchValue);
    }
  }

  async openSearchResultModal(searchValue: string) {
    const modal = await this.modalController.create({
      component: SearchResultPage,
      componentProps: {
        searchValue: searchValue,
        search: 1,
      },
    });

    await modal.present();
  }

  async openCouponModal(type: "local" | "national") {
    const modal = await this.modalController.create({
      component: CouponPage, // Use your modal component
      componentProps: {
        type: type,
      },
      // Optional modal options
      cssClass: "coupon-modal",
    });

    await modal.present();

    // Optional: Handle modal dismissal
    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log("Modal dismissed with data:", data);
    }
  }

  // Update these methods to use modals
  async nextLocalPage() {
    await this.openCouponModal("local");
  }

  async nextNationalPage() {
    await this.openCouponModal("national");
  }
}
