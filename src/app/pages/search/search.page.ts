import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { IonicModule, NavController } from "@ionic/angular";
import { AdMobService } from "../../../providers/admob/admob";
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: "search-page",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent],
})
export class SearchPage {
  submitted: boolean = true;
  resultStatus: any;
  showButton: boolean = true;
  searchValue: string = "";
  val: string = "";

  constructor(
    private navController: NavController,
    private router: Router,
    private adMobService: AdMobService,
  ) {}

  async ngOnInit() {
    await this.initializeAds();
  }

  async ngOnDestroy() {
    await this.adMobService.removeBannerAd();
  }

  private async initializeAds() {
    try {
      await this.adMobService.showBannerAd();
    } catch (error) {
      console.error("Failed to initialize ads:", error);
    }
  }

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  inappclick(link: string) {
    window.open(link, "_blank");
  }

  nextPage(id: any) {
    this.router.navigate(["/coupondetails"], { queryParams: { cid: id } });
  }

  home() {
    this.router.navigate(["/intro"]);
  }

  learn() {
    this.router.navigate(["/learnmore"]);
  }

  getItems(ev: any) {
    this.val = ev.target.value;
  }

  searchResult(searchValue: string) {
    if (searchValue) {
      this.router.navigate(["/search-result"], {
        queryParams: { val: searchValue, search: 1 },
      });
    }
  }

  nextLocalPage() {
    this.router.navigate(["/coupon"], { queryParams: { type: "local" } });
  }

  nextNationalPage() {
    this.router.navigate(["/coupon"], { queryParams: { type: "national" } });
  }
}
