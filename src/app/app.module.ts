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
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AuthService} from './services/auth.service';
import {EventsService} from './services/events.service';
import {FirestoreService} from './services/firestore.service';
import {GroupService} from './services/group.service';
import {TransactionService} from './services/transaction.service';
import {UserService} from './services/user.service';
import {ProductService} from './services/product.service';
import {HttpClient} from '@angular/common/http';
import {Plugins} from '@capacitor/core';
import {AngularFirestoreModule} from '@angular/fire/firestore';

const {FirebaseCrashlytics} = Plugins;

const SERVICES = [
    AuthService,
    EventsService,
    FirestoreService,
    GroupService,
    TransactionService,
    UserService,
    ProductService
];

@Injectable({
    providedIn: 'root'
})
export class CrashlyticsErrorHandler implements ErrorHandler {
    constructor() {
    }

    handleError(error) {
        console.error(error);
        FirebaseCrashlytics.crash({
            message: error.message || 'Unknown error occurred',
        });
    }
}

export function createTranslateLoader(http: HttpClient) {
    // return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule.enablePersistence(),
        AngularFireAuthModule,
        AngularFireFunctionsModule,
        AppRoutingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: ErrorHandler, useClass: CrashlyticsErrorHandler},
        ...SERVICES,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
