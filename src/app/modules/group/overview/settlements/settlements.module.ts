import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettlementsPageRoutingModule } from './settlements-routing.module';

import { SettlementsPage } from './settlements.page';
import {SharedModule} from '@shared/shared.module';
import {SettleGroupComponent} from '@modules/group/overview/settlements/settle-group/settle-group.component';

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
      SettleGroupComponent
  ]
})
export class SettlementsPageModule {}
