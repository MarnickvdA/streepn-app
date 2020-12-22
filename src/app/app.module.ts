import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AngularFireModule} from '@angular/fire';

import {environment} from '../environments/environment';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFireFunctionsModule, REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';
import {USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {AuthService} from './services/auth.service';
import {EventsService} from './services/events.service';
import {GroupService} from './services/group.service';
import {TransactionService} from './services/transaction.service';
import {UserService} from './services/user.service';
import {ProductService} from './services/product.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {PushService} from './services/push.service';
import {AnalyticsService} from './services/analytics.service';

const SERVICES = [
    AuthService,
    EventsService,
    GroupService,
    TransactionService,
    UserService,
    ProductService,
    PushService,
    AnalyticsService
];

@Injectable({
    providedIn: 'root'
})
export class AppErrorHandler implements ErrorHandler {
    constructor() {
    }

    handleError(error) {
        console.error(error);
    }
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            backButtonIcon: 'arrow-back-outline',
            backButtonText: ''
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireFunctionsModule,
        AppRoutingModule
    ],
    exports: [
        TranslateModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: ErrorHandler, useClass: AppErrorHandler},
        {provide: REGION, useValue: 'europe-west1'},
        {provide: USE_AUTH_EMULATOR, useValue: !environment.production ? ['localhost', 9099] : undefined},
        {provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined},
        {provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined},
        ...SERVICES,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
