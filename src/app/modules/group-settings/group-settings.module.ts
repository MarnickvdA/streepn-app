import {NgModule} from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {GroupSettingsPageRoutingModule} from './group-settings-routing.module';

import {GroupSettingsPage} from './group-settings.page';
import {TranslateModule} from '@ngx-translate/core';
import {ProductItemComponent} from './components/product-item/product-item.component';
import {UserAccountItemComponent} from './components/user-account-item/user-account-item.component';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {SharedAccountItemComponent} from './components/shared-account-item/shared-account-item.component';
import {MoneyInputComponent} from './components/money-input/money-input.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupSettingsPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
    ],
    providers: [
        CurrencyPipe
    ],
    declarations: [
        GroupSettingsPage,
        ProductItemComponent,
        UserAccountItemComponent,
        SharedAccountItemComponent,
        NewProductComponent,
        NewSharedAccountComponent,
        MoneyInputComponent,
    ]
})
export class GroupSettingsPageModule {
}
