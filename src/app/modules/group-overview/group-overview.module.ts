import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {GroupOverviewPageRoutingModule} from './group-overview-routing.module';

import {GroupOverviewPage} from './group-overview.page';
import {TranslateModule} from '@ngx-translate/core';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {SharedModule} from '@shared/shared.module';
import {AddStockComponent} from './add-stock/add-stock.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupOverviewPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [
        GroupOverviewPage,
        AddStockComponent,
        NewProductComponent,
        NewSharedAccountComponent,
    ]
})
export class GroupOverviewPageModule {
}
