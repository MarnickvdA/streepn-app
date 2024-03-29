import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {SharedModule} from '@shared/shared.module';
import {OverviewPage} from '@modules/house/overview/overview.page';
import {OverviewPageRoutingModule} from '@modules/house/overview/overview-routing.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OverviewPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
        FontAwesomeModule,
    ],
    declarations: [
        OverviewPage,
        NewSharedAccountComponent,
    ]
})
export class OverviewPageModule {
}
