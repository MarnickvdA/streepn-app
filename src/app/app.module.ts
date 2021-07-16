import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '@core/core.module';
import {SharedModule} from '@shared/shared.module';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {RouteReuseStrategy} from '@angular/router';
import {environment} from '@env/environment';
import * as Sentry from '@sentry/browser';
import {LoggerService} from '@core/services';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

if (environment.production) {
    Sentry.init({
        dsn: 'https://898ea0c4100341d581f3a5d645db3c12@o352784.ingest.sentry.io/5178411',
        debug: !environment.production,
        release: environment.version,
        environment: environment.production ? 'prod' : 'debug',
        tracesSampleRate: 1.0,
    });
}

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

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [],
    imports: [
        BrowserModule,
        CoreModule,
        SharedModule.forRoot(),
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
        AppRoutingModule,
        FontAwesomeModule,
    ],
    exports: [TranslateModule],
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: ErrorHandler, useClass: SentryErrorHandler},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
