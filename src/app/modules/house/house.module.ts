import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import {HousePage} from '@modules/house/house.page';
import {TranslateModule} from '@ngx-translate/core';
import {AddTransactionComponent} from '@modules/house/add-transaction/add-transaction.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HousePageRoutingModule} from '@modules/house/house-routing.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HousePageRoutingModule,
        TranslateModule,
        FontAwesomeModule,
        SharedModule
    ],
    declarations: [
        HousePage,
        AddTransactionComponent
    ]
})
export class HousePageModule {
}
