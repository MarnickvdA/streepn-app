import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {StockLogPageRoutingModule} from './stock-log-routing.module';

import {StockLogPage} from './stock-log.page';
import {EditStockComponent} from '@modules/house/stock/stock-log/edit-stock/edit-stock.component';
import {TranslateModule} from '@ngx-translate/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StockLogPageRoutingModule,
        TranslateModule,
        FontAwesomeModule,
        SharedModule
    ],
    declarations: [
        StockLogPage,
        EditStockComponent
    ]
})
export class StockLogPageModule {
}
