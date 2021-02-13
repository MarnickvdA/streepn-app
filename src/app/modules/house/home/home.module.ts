import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {HomePageRoutingModule} from '@modules/house/home/home-routing.module';
import {HomePage} from '@modules/house/home/home.page';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        TranslateModule,
        FontAwesomeModule,
        SharedModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
