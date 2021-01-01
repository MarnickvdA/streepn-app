import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {GroupPageRoutingModule} from './group-routing.module';

import {GroupPage} from './group.page';
import {TranslateModule} from '@ngx-translate/core';
import {AddTransactionComponent} from './add-transaction/add-transaction.component';
import {TransactionDetailPage} from './transaction-detail/transaction-detail.page';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupPageRoutingModule,
        TranslateModule,
        InfiniteScrollModule
    ],
    declarations: [
        GroupPage,
        AddTransactionComponent,
        TransactionDetailPage
    ]
})
export class GroupPageModule {
}
