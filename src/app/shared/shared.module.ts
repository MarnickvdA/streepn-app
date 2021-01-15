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
import {SideMenuComponent} from '@shared/components/side-menu/side-menu.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MoneyPipe} from './pipes/money.pipe';

export const components = [
    MoneyInputComponent,
    ProductItemComponent,
    UserAccountItemComponent,
    SharedAccountItemComponent,
    ProductStockItemComponent,
    SideMenuComponent
];

export const pipes = [
    MoneyPipe,
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
