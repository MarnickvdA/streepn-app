import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {HousePage} from './house.page';

const routes: Routes = [
    {
        path: ':id',
        component: HousePage,
        children: [
            {
                path: 'transactions',
                loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsPageModule)
            },
            {
                path: 'deals',
                loadChildren: () => import('./deals/deals.module').then(m => m.DealsPageModule)
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
                path: '**',
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
export class HousePageRoutingModule {
}
