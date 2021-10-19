import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MoneyInputComponent} from './components/money-input/money-input.component';
import {IonicModule} from '@ionic/angular';
import {ProductItemComponent} from './components/product-item/product-item.component';
import {UserAccountItemComponent} from './components/user-account-item/user-account-item.component';
import {SharedAccountItemComponent} from './components/shared-account-item/shared-account-item.component';
import {RouterModule} from '@angular/router';
import {ProductStockItemComponent} from './components/product-stock-item/product-stock-item.component';
import {SideMenuComponent} from './components/side-menu/side-menu.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MoneyPipe} from './pipes/money.pipe';
import {TransactionItemComponent} from './components/transaction-item/transaction-item.component';
import {ObsStatusPipe} from './pipes/obs-status.pipe';
import {AbsPipe} from './pipes/abs.pipe';
import {DateTimePipe} from './pipes/date-time.pipe';
import {MomentPipe} from './pipes/moment.pipe';
import {DatePipe} from './pipes/date.pipe';
import {CapitalizePipe} from './pipes/capitalize.pipe';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {IconsModule} from '@shared/icons.module';
import {AccountAvatarComponent} from '@shared/components/account-avatar/account-avatar.component';
import {HouseSettlementItemComponent} from '@shared/components/house-settlement-item/house-settlement-item.component';
import {SharedAccountSettlementItemComponent} from '@shared/components/shared-account-settlement-item/shared-account-settlement-item.component';
import { UserAccountSettlementItemComponent } from './components/user-account-settlement-item/user-account-settlement-item.component';

export const components = [
    MoneyInputComponent,
    ProductItemComponent,
    UserAccountItemComponent,
    SharedAccountItemComponent,
    ProductStockItemComponent,
    SideMenuComponent,
    TransactionItemComponent,
    InfoModalComponent,
    AccountAvatarComponent,
    HouseSettlementItemComponent,
    SharedAccountSettlementItemComponent,
    UserAccountSettlementItemComponent
];

export const pipes = [
    MoneyPipe,
    ObsStatusPipe,
    AbsPipe,
    DateTimePipe,
    MomentPipe,
    DatePipe,
    CapitalizePipe,
];

@NgModule({
    declarations: [
        ...components,
        ...pipes,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        IonicModule,
        RouterModule,
        FontAwesomeModule,
        IconsModule,
    ],
    providers: [
        CurrencyPipe
    ],
    exports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        FontAwesomeModule,
        IconsModule,
        ...components,
        ...pipes,
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }
}
