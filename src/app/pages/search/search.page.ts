import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'search-page',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false
})
export class SearchPage {

  submitted = true;
  showButton = true;
  search: any = { value: '' };
  val: any;

  constructor(private router: Router) {}

  onCancel() {
    this.submitted = true;
    this.showButton = true;
  }

  getItems(ev: any) {
    this.val = ev.target.value;
  }

  searchresult() {
    this.router.navigate(['/search-result'], {
      queryParams: {
        val: this.val,
        search: 1
      }
    });
  }

  nextlocalPage() {
    this.router.navigate(['/coupon'], {
      queryParams: { type: 'local' }
    });
  }

  nextnationalPage() {
    this.router.navigate(['/coupon'], {
      queryParams: { type: 'national' }
    });
  }
}
