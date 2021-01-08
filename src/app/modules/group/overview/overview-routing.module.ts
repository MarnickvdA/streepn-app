import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OverviewPage} from '@modules/group/overview/overview.page';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: OverviewPage,
    },
    {
        path: 'accounts',
        loadChildren: () => import('./account-detail/account-detail.module').then(m => m.AccountDetailPageModule)
    },
    {
        path: 'shared-accounts',
        loadChildren: () => import('./shared-account-detail/shared-account-detail.module').then(m => m.SharedAccountDetailPageModule)
    },
    {
        path: 'products',
        loadChildren: () => import('./product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OverviewPageRoutingModule {
}
