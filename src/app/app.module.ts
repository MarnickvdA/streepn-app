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
import {LoggerService} from '@core/services';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

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

export const createTranslateLoader = (http: HttpClient) => new TranslateHttpLoader(http, 'assets/i18n/', '.json');

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
