import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SettlementsPageRoutingModule} from './settlements-routing.module';

import {SettlementsPage} from './settlements.page';
import {SharedModule} from '@shared/shared.module';
import {SettleHouseComponent} from '@modules/house/overview/settlements/settle-house/settle-house.component';
import {SettlementDetailComponent} from '@modules/house/overview/settlements/settlement-detail/settlement-detail.component';

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
        SettlementDetailComponent,
    ]
})
export class SettlementsPageModule {
}
