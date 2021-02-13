import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {TransactionDetailPage} from './transaction-detail/transaction-detail.page';
import {TransactionsPage} from '@modules/house/transactions/transactions.page';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: TransactionsPage,
    },
    {
        path: ':transactionId',
        component: TransactionDetailPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TransactionsPageRoutingModule {
}
