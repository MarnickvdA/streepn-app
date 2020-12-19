import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AuthService } from './services/auth.service';
import { EventsService } from './services/events.service';
import { FirestoreService } from './services/firestore.service';
import { GroupService } from './services/group.service';
import { TransactionService } from './services/transaction.service';
import { UserService } from './services/user.service';
const SERVICES = [
    AuthService,
    EventsService,
    FirestoreService,
    GroupService,
    TransactionService,
    UserService
];
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [AppComponent],
        entryComponents: [],
        imports: [
            BrowserModule,
            IonicModule.forRoot(),
            AngularFireModule.initializeApp(environment.firebaseConfig, 'Streepn'),
            AngularFireAuthModule,
            AngularFireFunctionsModule,
            AppRoutingModule
        ],
        providers: [
            StatusBar,
            SplashScreen,
            { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
            ...SERVICES,
        ],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map