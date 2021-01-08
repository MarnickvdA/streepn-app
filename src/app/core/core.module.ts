import {ErrorHandler, Injectable, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {
    AdsService,
    AnalyticsService,
    AuthService,
    EventsService,
    GroupService,
    LoggerService,
    ProductService,
    PushService,
    StockService,
    StorageService,
    TransactionService,
    UIService,
    UserService
} from '@core/services';
import {GooglePlus} from '@ionic-native/google-plus/ngx';

export const services = [
    AuthService,
    EventsService,
    PushService,
    AnalyticsService,
    AdsService,
    StorageService,
    UIService,

    // Model services
    GroupService,
    TransactionService,
    UserService,
    ProductService,
    StockService,
];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule
    ],
    providers: [
        // Cordova plugins
        GooglePlus,

        // Core services
        ...services
    ]
})
export class CoreModule {
    public constructor(@SkipSelf() @Optional() parent: CoreModule) {
        if (parent) {
            throw new Error(`${parent.constructor.name} has already been loaded.`);
        }
    }
}
