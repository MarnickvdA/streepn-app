import {TestBed} from '@angular/core/testing';

import {TransactionService} from '@core/services';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFirePerformance, AngularFirePerformanceModule} from '@angular/fire/performance';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
import {SharedModule} from '@shared/shared.module';

describe('TransactionService', () => {
    let service: TransactionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),
                RouterTestingModule,
            ],
            providers: [
                navControllerMock,
                AngularFireAuth,
                AngularFirestore,
                AngularFireStorage,
                AngularFirePerformance
            ]
        });
        service = TestBed.inject(TransactionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
