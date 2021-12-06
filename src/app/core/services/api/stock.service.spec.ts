import {TestBed} from '@angular/core/testing';

import {StockService} from '@core/services';
import {environment} from '@env/environment.test';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Functions} from '@angular/fire/functions';
import {Performance} from '@angular/fire/performance';

describe('SupplyService', () => {
    let service: StockService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [provideFirebaseApp(() => initializeApp(environment.firebaseConfig))],
            providers: [Firestore, Functions, Performance]
        });
        service = TestBed.inject(StockService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
