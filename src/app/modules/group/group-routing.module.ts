import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupPage} from './group.page';

const routes: Routes = [
    {
        path: ':id',
        component: GroupPage,
        children: [
            {
                path: 'home',
                loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
            },
            {
                path: 'transactions',
                loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsPageModule)
            },
            {
                path: 'stock',
                loadChildren: () => import('./stock/stock.module').then(m => m.StockPageModule)
            },
            {
                path: 'preferences',
                loadChildren: () => import('./overview/overview.module').then(m => m.OverviewPageModule)
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
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
