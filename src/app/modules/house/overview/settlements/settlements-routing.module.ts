import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SettlementsPage} from './settlements.page';
import {HouseSettlementDetailComponent} from '@modules/house/overview/settlements/house-settlement-detail/house-settlement-detail.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SettlementsPage
    },
    {
        path: 'house/:settlementId',
        component: HouseSettlementDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettlementsPageRoutingModule {
}
