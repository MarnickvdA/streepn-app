import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupSettingsPage} from './group-settings.page';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: GroupSettingsPage,
    },
    {
        path: 'accounts',
        loadChildren: () => import('./account-detail/account-detail.module').then(m => m.AccountDetailPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GroupSettingsPageRoutingModule {
}
