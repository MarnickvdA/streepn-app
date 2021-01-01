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
                path: 'settings',
                loadChildren: () => import('../group-settings/group-settings.module').then(m => m.GroupSettingsPageModule)
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
