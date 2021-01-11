import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SharedAccountDetailPageRoutingModule} from './shared-account-detail-routing.module';

import {SharedAccountDetailPage} from './shared-account-detail.page';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        SharedAccountDetailPageRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [SharedAccountDetailPage]
})
export class SharedAccountDetailPageModule {
}
