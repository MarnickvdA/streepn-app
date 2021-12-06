import {TestBed} from '@angular/core/testing';

import {TransactionService} from '@core/services';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {SharedModule} from '@shared/shared.module';
import {Firestore} from '@angular/fire/firestore';
import {Functions} from '@angular/fire/functions';
import {Performance} from '@angular/fire/performance';
import {Auth} from '@angular/fire/auth';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';

describe('TransactionService', () => {
    let service: TransactionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
                RouterTestingModule,
            ],
            providers: [
                navControllerMock,
                Auth,
                Firestore,
                Functions,
                Performance
            ]
        });
        service = TestBed.inject(TransactionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
