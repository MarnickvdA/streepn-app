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
    TransactionService
} from '@core/services';
import {environment} from '@env/environment';
import {SettlementService} from '@core/services/api/settlement.service';
import {ImageService} from '@core/services/image.service';
import {AlertService} from '@core/services/alert.service';
import {getApp, initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {connectFirestoreEmulator, initializeFirestore, provideFirestore} from '@angular/fire/firestore';
import {connectFunctionsEmulator, getFunctions, provideFunctions} from '@angular/fire/functions';
import {getPerformance, providePerformance} from '@angular/fire/performance';
import {connectStorageEmulator, getStorage, provideStorage} from '@angular/fire/storage';
import {connectAuthEmulator, getAuth, provideAuth} from '@angular/fire/auth';

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
];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule,
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => {
            const auth = getAuth();
            connectAuthEmulator(auth, 'http://localhost:9099');
            return auth;
        }),
        provideFirestore(() => {
            const firestore = initializeFirestore(getApp(), {
                ignoreUndefinedProperties: true,
                cacheSizeBytes: 1048576
            });
            connectFirestoreEmulator(firestore, 'localhost', 8080);
            return firestore;
        }),
        provideFunctions(() => {
            const functions = getFunctions(getApp(), 'europe-west1');
            connectFunctionsEmulator(functions, 'localhost', 5001);
            return functions;
        }),
        providePerformance(() => getPerformance()),
        provideStorage(() => {
            const storage = getStorage();
            connectStorageEmulator(storage, 'localhost', 9199);
            return storage;
        }),
    ],
    providers: [
        // Cordova plugins
        // ...

        // Core services
        ...services,
    ]
})
export class CoreModule {
    public constructor(@SkipSelf() @Optional() parent: CoreModule) {
        if (parent) {
            throw new Error(`${parent.constructor.name} has already been loaded.`);
        }
    }
}
