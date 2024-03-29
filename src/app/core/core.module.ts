import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {
    AnalyticsService,
    AuthService,
    EventsService,
    HouseService,
    ProductService,
    PushService,
    StockService,
    StorageService,
    TransactionService,
    DealsService
} from '@core/services';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFireFunctionsModule, REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';
import {SETTINGS, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {SettlementService} from '@core/services/api/settlement.service';
import {AngularFirePerformanceModule} from '@angular/fire/performance';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {ImageService} from '@core/services/image.service';
import {AlertService} from '@core/services/alert.service';

require('./firebase-init');

export const services = [
    EventsService,
    StorageService,
    ImageService,
    AlertService,

    // Firebase services
    AuthService,
    PushService,
    AnalyticsService,

    // API services
    HouseService,
    TransactionService,
    ProductService,
    StockService,
    SettlementService,
    DealsService
];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireFunctionsModule,
        AngularFirePerformanceModule,
        AngularFireStorageModule,
    ],
    providers: [
        // Cordova plugins
        // ...

        // Core services
        ...services,

        // Firebase
        {provide: REGION, useValue: 'europe-west1'},
        {provide: USE_AUTH_EMULATOR, useValue: !environment.production ? ['localhost', 9099] : undefined},
        {provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined},
        {provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined},
        {provide: SETTINGS, useValue: {ignoreUndefinedProperties: true, cacheSizeBytes: 1048576}},
    ]
})
export class CoreModule {
    public constructor(@SkipSelf() @Optional() parent: CoreModule) {
        if (parent) {
            throw new Error(`${parent.constructor.name} has already been loaded.`);
        }
    }
}
