import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {
    AdsService,
    AnalyticsService,
    AuthService,
    EventsService,
    GroupService,
    ProductService,
    PushService,
    StockService,
    StorageService,
    TransactionService,
    UIService,
    UserService
} from '@core/services';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFireFunctionsModule, REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';
import {USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';

require('./firebase-init');

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
        TranslateModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireFunctionsModule,
    ],
    providers: [
        // Cordova plugins
        GooglePlus,

        // Core services
        ...services,

        // Firebase
        {provide: REGION, useValue: 'europe-west1'},
        {provide: USE_AUTH_EMULATOR, useValue: !environment.production ? ['localhost', 9099] : undefined},
        {provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined},
        {provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined},
    ]
})
export class CoreModule {
    public constructor(@SkipSelf() @Optional() parent: CoreModule) {
        if (parent) {
            throw new Error(`${parent.constructor.name} has already been loaded.`);
        }
    }
}
