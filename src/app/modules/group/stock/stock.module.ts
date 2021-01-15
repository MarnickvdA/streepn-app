import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {StockPageRoutingModule} from '@modules/group/stock/stock-routing.module';
import {StockPage} from '@modules/group/stock/stock.page';
import {SharedModule} from '@shared/shared.module';
import {AddStockComponent} from '@modules/group/stock/add-stock/add-stock.component';
import {RemoveStockComponent} from '@modules/group/stock/remove-stock/remove-stock.component';
import {NewProductComponent} from '@modules/group/stock/new-product/new-product.component';

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
        RemoveStockComponent,
        NewProductComponent,
    ]
})
export class StockPageModule {
}
