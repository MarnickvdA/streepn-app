import {ErrorHandler, Injectable, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouteReuseStrategy} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '@core/services';
import {EventsService} from '@core/services';
import {GroupService} from '@core/services';
import {TransactionService} from '@core/services';
import {UserService} from '@core/services';
import {ProductService} from '@core/services';
import {PushService} from '@core/services';
import {AnalyticsService} from '@core/services';
import {AdsService} from '@core/services';
import {StorageService} from '@core/services';
import {UIService} from '@core/services';
import {IonicRouteStrategy} from '@ionic/angular';
import {AngularFireFunctionsModule, REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {environment} from '@env/environment';
import {USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {AngularFireModule} from '@angular/fire';
import * as Sentry from '@sentry/browser';
import {LoggerService} from '@core/services';
import {StockService} from '@core/services';
import firebase from 'firebase/app';

Sentry.init({
    dsn: 'https://898ea0c4100341d581f3a5d645db3c12@o352784.ingest.sentry.io/5178411',
    debug: !environment.production,
    enabled: environment.production,
    release: environment.version,
    environment: environment.production ? 'prod' : 'debug',
    tracesSampleRate: 1.0,
});

@Injectable({
    providedIn: 'root'
})
export class SentryErrorHandler implements ErrorHandler {
    constructor() {
    }

    handleError(error) {
        LoggerService.handleError(error);
    }
}


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
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: REGION, useValue: 'europe-west1'},
        {provide: USE_AUTH_EMULATOR, useValue: !environment.production ? ['localhost', 9099] : undefined},
        {provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined},
        {provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined},
        {provide: ErrorHandler, useClass: SentryErrorHandler},

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
