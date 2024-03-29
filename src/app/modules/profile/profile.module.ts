import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ProfilePageRoutingModule} from './profile-routing.module';

import {ProfilePage} from './profile.page';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProfilePageRoutingModule,
        TranslateModule,
        SharedModule
    ],
    declarations: [ProfilePage]
})
export class ProfilePageModule {
}
