import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SettlementsPageRoutingModule} from './settlements-routing.module';

import {SettlementsPage} from './settlements.page';
import {SharedModule} from '@shared/shared.module';
import {SettleHouseComponent} from '@modules/house/overview/settlements/settle-house/settle-house.component';
// eslint-disable-next-line max-len
import {HouseSettlementDetailComponent} from '@modules/house/overview/settlements/house-settlement-detail/house-settlement-detail.component';
import {SettleSharedAccountComponent} from '@modules/house/overview/settlements/settle-shared-account/settle-shared-account.component';
import {SettleUserAccountComponent} from '@modules/house/overview/settlements/settle-user-account/settle-user-account.component';
// eslint-disable-next-line max-len
import {SharedAccountSettlementDetailComponent} from '@modules/house/overview/settlements/shared-account-settlement-detail/shared-account-settlement-detail.component';
// eslint-disable-next-line max-len
import {UserAccountSettlementDetailComponent} from '@modules/house/overview/settlements/user-account-settlement-detail/user-account-settlement-detail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SettlementsPageRoutingModule,
        SharedModule
    ],
    declarations: [
        SettlementsPage,
        SettleHouseComponent,
        HouseSettlementDetailComponent,
        SharedAccountSettlementDetailComponent,
        UserAccountSettlementDetailComponent,
        SettleUserAccountComponent,
        SettleSharedAccountComponent,
    ]
})
export class SettlementsPageModule {
}
