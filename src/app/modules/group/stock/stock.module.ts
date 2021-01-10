import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {StockPageRoutingModule} from '@modules/group/stock/stock-routing.module';
import {StockPage} from '@modules/group/stock/stock.page';
import {SharedModule} from '@shared/shared.module';
import {AddStockComponent} from '@modules/group/stock/add-stock/add-stock.component';
import {EditStockComponent} from '@modules/group/stock/edit-stock/edit-stock.component';

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
        EditStockComponent
    ]
})
export class StockPageModule {
}
