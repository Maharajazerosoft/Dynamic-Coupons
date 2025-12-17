import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'search-page',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SearchPage {
  submitted: boolean = true;
  resultStatus: any;
  showButton: boolean = true;
  searchValue: string = '';
  val: string = '';

  constructor(private navController: NavController, private router: Router) {}

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  inappclick(link: string) {
    window.open(link, '_blank');
  }

  nextPage(id: any) {
    this.router.navigate(['/coupondetails'], { queryParams: { cid: id } });
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
      this.router.navigate(['/searchresults'], {
        queryParams: { val: searchValue, search: 1 },
      });
    }
  }

  nextLocalPage() {
    this.router.navigate(['/coupon'], { queryParams: { type: 'local' } });
  }

  nextNationalPage() {
    this.router.navigate(['/coupon'], { queryParams: { type: 'national' } });
  }
}
