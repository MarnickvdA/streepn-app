import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {SharedModule} from '@shared/shared.module';
import {AddStockComponent} from './add-stock/add-stock.component';
import {OverviewPage} from '@modules/group/overview/overview.page';
import {OverviewPageRoutingModule} from '@modules/group/overview/overview-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OverviewPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [
        OverviewPage,
        AddStockComponent,
        NewProductComponent,
        NewSharedAccountComponent,
    ]
})
export class OverviewPageModule {
}
