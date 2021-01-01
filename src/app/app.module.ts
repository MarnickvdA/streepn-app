import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {IonicModule} from '@ionic/angular';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
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
        AppRoutingModule
    ],
    exports: [
        TranslateModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
