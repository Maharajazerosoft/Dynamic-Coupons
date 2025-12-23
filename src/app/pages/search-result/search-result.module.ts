import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SearchResultPage } from './search-result.page';
import { SearchResultPageRoutingModule } from './search-result-routing.module';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchResultPageRoutingModule
  ],
  declarations: [
    SearchResultPage,
    SafeHtmlPipe
  ]
})
export class SearchResultPageModule {}
