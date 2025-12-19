import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ModalController } from '@ionic/angular'; // Add ModalController
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SearchResultPage } from '../search-result/search-result.page'; // Import the SearchResultPage

@Component({
  selector: 'search-page',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent],
})
export class SearchPage {
  submitted: boolean = true;
  resultStatus: any;
  showButton: boolean = true;
  searchValue: string = '';
  val: string = '';

  constructor(
    private navController: NavController, 
    private router: Router,
    private modalController: ModalController // Add ModalController
  ) {}

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
