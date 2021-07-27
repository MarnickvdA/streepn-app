import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {LoginPageRoutingModule} from './login-routing.module';

import {LoginPage} from './login.page';
import {TranslateModule} from '@ngx-translate/core';
import {IconsModule} from '@shared/icons.module';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        LoginPageRoutingModule,
        ReactiveFormsModule,
        TranslateModule,
        IconsModule,
    ],
    declarations: [LoginPage]
})
export class LoginPageModule {
}
