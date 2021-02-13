import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {StockPageRoutingModule} from '@modules/house/stock/stock-routing.module';
import {StockPage} from '@modules/house/stock/stock.page';
import {SharedModule} from '@shared/shared.module';
import {AddStockComponent} from '@modules/house/stock/add-stock/add-stock.component';
import {NewProductComponent} from '@modules/house/stock/new-product/new-product.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StockPageRoutingModule,
        TranslateModule,
        SharedModule
    ],
    declarations: [
        StockPage,
        AddStockComponent,
        NewProductComponent,
    ]
})
export class StockPageModule {
}
