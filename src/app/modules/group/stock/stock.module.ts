import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {StockPageRoutingModule} from '@modules/group/stock/stock-routing.module';
import {StockPage} from '@modules/group/stock/stock.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StockPageRoutingModule,
        TranslateModule
    ],
  declarations: [StockPage]
})
export class StockPageModule {}
