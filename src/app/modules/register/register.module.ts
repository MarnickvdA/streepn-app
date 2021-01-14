import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {RegisterPageRoutingModule} from './register-routing.module';

import {RegisterPage} from './register.page';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegisterPageRoutingModule,
        ReactiveFormsModule,
        TranslateModule,
        SharedModule
    ],
    declarations: [RegisterPage]
})
export class RegisterPageModule {
}
