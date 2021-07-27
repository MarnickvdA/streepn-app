import {TestBed} from '@angular/core/testing';

import {SettlementService} from './settlement.service';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';

describe('SettlementService', () => {
    let service: SettlementService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AngularFireModule.initializeApp(environment.firebaseConfig),]
        });
        service = TestBed.inject(SettlementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
