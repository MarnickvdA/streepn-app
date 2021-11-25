import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SettlementsPage} from './settlements.page';
// eslint-disable-next-line max-len
import {HouseSettlementDetailComponent} from '@modules/house/overview/settlements/house-settlement-detail/house-settlement-detail.component';
// eslint-disable-next-line max-len
import {UserAccountSettlementDetailComponent} from '@modules/house/overview/settlements/user-account-settlement-detail/user-account-settlement-detail.component';
// eslint-disable-next-line max-len
import {SharedAccountSettlementDetailComponent} from '@modules/house/overview/settlements/shared-account-settlement-detail/shared-account-settlement-detail.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SettlementsPage
    },
    {
        path: 'house/:settlementId',
        component: HouseSettlementDetailComponent
    },
    {
        path: 'user/:settlementId',
        component: UserAccountSettlementDetailComponent
    },
    {
        path: 'shared/:settlementId',
        component: SharedAccountSettlementDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettlementsPageRoutingModule {
}
