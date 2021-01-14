import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {TransactionDetailPage} from './transaction-detail/transaction-detail.page';
import {TransactionsPage} from '@modules/group/transactions/transactions.page';
import {TransactionsPageRoutingModule} from '@modules/group/transactions/transactions-routing.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TransactionsPageRoutingModule,
        TranslateModule,
        SharedModule
    ],
    declarations: [
        TransactionsPage,
        TransactionDetailPage
    ]
})
export class TransactionsPageModule {
}
