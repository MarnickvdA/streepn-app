import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SettlementsPage} from './settlements.page';
import {SettlementDetailComponent} from '@modules/group/overview/settlements/settlement-detail/settlement-detail.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SettlementsPage
    },
    {
        path: ':settlementId',
        component: SettlementDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettlementsPageRoutingModule {
}
