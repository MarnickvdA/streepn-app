import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {HomePageRoutingModule} from '@modules/group/home/home-routing.module';
import {HomePage} from '@modules/group/home/home.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        TranslateModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
