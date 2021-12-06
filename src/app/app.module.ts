import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '@core/core.module';
import {SharedModule} from '@shared/shared.module';
import {RouteReuseStrategy} from '@angular/router';
import {LoggerService} from '@core/services';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {TranslationModule} from './translation.module';

@Injectable({
    providedIn: 'root'
})
export class SentryErrorHandler implements ErrorHandler {
    handleError(error) {
        LoggerService.handleError(error);
    }
}

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            backButtonIcon: 'arrow-back-outline',
            backButtonText: ''
        }),
        TranslationModule.forRoot(),
        AppRoutingModule,
        FontAwesomeModule,
        CoreModule,
        SharedModule.forRoot(),
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
