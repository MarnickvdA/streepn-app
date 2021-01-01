import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupPage} from './group.page';
import {TransactionDetailPage} from './transaction-detail/transaction-detail.page';

const routes: Routes = [
    {
        path: ':id',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GroupPage,
            },
            {
                path: 'overview',
                loadChildren: () => import('../group-overview/group-overview.module').then(m => m.GroupOverviewPageModule)
            },
            {
                path: 'transactions/:transactionId',
                component: TransactionDetailPage
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GroupPageRoutingModule {
}
