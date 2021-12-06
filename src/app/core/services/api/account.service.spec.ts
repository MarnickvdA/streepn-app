import {TestBed} from '@angular/core/testing';

import {AccountService} from '@core/services';
import {environment} from '@env/environment.test';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Functions} from '@angular/fire/functions';

describe('AccountService', () => {
    let service: AccountService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
            ],
            providers: [
                Firestore,
                Functions
            ]
        });
        service = TestBed.inject(AccountService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
