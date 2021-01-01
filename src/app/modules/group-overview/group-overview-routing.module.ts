import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupOverviewPage} from './group-overview.page';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: GroupOverviewPage,
    },
    {
        path: 'accounts',
        loadChildren: () => import('./account-detail/account-detail.module').then(m => m.AccountDetailPageModule)
    },
    {
        path: 'new-shared-account',
        component: NewSharedAccountComponent
    },
    {
        path: 'new-product',
        component: NewProductComponent
    },
    {
        path: 'preferences',
        loadChildren: () => import('./preferences/preferences.module').then(m => m.PreferencesPageModule)
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GroupOverviewPageRoutingModule {
}
