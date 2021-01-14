import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SharedAccountDetailPageRoutingModule} from './shared-account-detail-routing.module';

import {SharedAccountDetailPage} from './shared-account-detail.page';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '@shared/shared.module';
import {SettleComponent} from '@modules/group/overview/shared-account-detail/settle/settle.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        SharedAccountDetailPageRoutingModule,
        ReactiveFormsModule,
        SharedModule
    ],
    declarations: [SharedAccountDetailPage, SettleComponent]
})
export class SharedAccountDetailPageModule {
}
