import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountDetailPage} from './account-detail.page';

const routes: Routes = [
    {
        path: ':accountId',
        component: AccountDetailPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccountDetailPageRoutingModule {
}
