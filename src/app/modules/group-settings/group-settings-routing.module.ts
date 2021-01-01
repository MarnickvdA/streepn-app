import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupSettingsPage} from './group-settings.page';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: GroupSettingsPage,
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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GroupSettingsPageRoutingModule {
}
