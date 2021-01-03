import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SharedAccountDetailPage} from './shared-account-detail.page';

const routes: Routes = [
    {
        path: ':accountId',
        component: SharedAccountDetailPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SharedAccountDetailPageRoutingModule {
}
