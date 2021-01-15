import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AccountDetailPageRoutingModule} from './account-detail-routing.module';

import {AccountDetailPage} from './account-detail.page';
import {TranslateModule} from '@ngx-translate/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccountDetailPageRoutingModule,
        TranslateModule,
        FontAwesomeModule,
        SharedModule
    ],
    declarations: [AccountDetailPage]
})
export class AccountDetailPageModule {
}
