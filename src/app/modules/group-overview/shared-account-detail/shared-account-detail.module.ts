import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SharedAccountDetailPageRoutingModule} from './shared-account-detail-routing.module';

import {SharedAccountDetailPage} from './shared-account-detail.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedAccountDetailPageRoutingModule
    ],
    declarations: [SharedAccountDetailPage]
})
export class SharedAccountDetailPageModule {
}
