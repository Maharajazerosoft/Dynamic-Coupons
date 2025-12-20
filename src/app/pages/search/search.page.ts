import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { IonicModule, NavController, Platform, ModalController } from "@ionic/angular";
import { AdMobService } from "../../../providers/admob/admob";
import { HeaderComponent } from "../../components/header/header.component";
import { environment } from "../../../environments/environment";
import { SearchResultPage } from "../search-result/search-result.page";

@Component({
  selector: 'search-page',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent],
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
    private navController: NavController, 
    private modalController: ModalController,
    private router: Router,
    private adMobService: AdMobService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.loadAd();
  }

  async ngOnDestroy() {
    await this.adMobService.removeBannerAd();
  }

  async loadAd() {
    try {
      this.adStatus = 'Loading banner ad...';
      console.log(this.adStatus);
      
      await this.adMobService.showBannerAd();
      
      this.adStatus = 'Ad loaded';
      console.log('Ad loaded successfully');
      
    } catch (error: any) {
      this.adStatus = 'Ad error: ' + (error.message || 'Unknown error');
      console.error("Ad error:", error);
    }
  }

  async testAd() {
    console.log('Testing ad...');
    this.adStatus = 'Testing...';
    
    try {
      await this.adMobService.showBannerAd();
      this.adStatus = 'Test passed';
    } catch (error) {
      this.adStatus = 'Test failed';
      console.error('Ad test failed:', error);
    }
  }

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  inappclick(link: string) {
    window.open(link, '_blank');
  }

  nextPage(id: any) {
    this.router.navigate(['/coupon-details'], { queryParams: { cid: id } });
  }

  home() {
    this.router.navigate(['/intro']);
  }

  learn() {
    this.router.navigate(['/learnmore']);
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
        search: 1
      },

    });

    await modal.present();

  }

  nextLocalPage() {
    this.router.navigate(['/coupon'], { queryParams: { type: 'local' } });
  }

  nextNationalPage() {
    this.router.navigate(['/coupon'], { queryParams: { type: 'national' } });
  }
}