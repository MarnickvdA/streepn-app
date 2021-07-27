import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StockPage} from '@modules/house/stock/stock.page';

const routes: Routes = [
    {
        path: '',
        component: StockPage
    },
    {
        path: 'log',
        loadChildren: () => import('./stock-log/stock-log.module').then(m => m.StockLogPageModule)
    },
    {
        path: 'products',
        loadChildren: () => import('../stock/product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StockPageRoutingModule {
}
