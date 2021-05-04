import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {SharedModule} from '@shared/shared.module';
import {DealsPageRoutingModule} from '@modules/house/deals/deals-routing.module';
import {DealsPage} from '@modules/house/deals/deals.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DealsPageRoutingModule,
        TranslateModule,
        FontAwesomeModule,
        SharedModule
    ],
    declarations: [DealsPage]
})
export class DealsPageModule {
}
