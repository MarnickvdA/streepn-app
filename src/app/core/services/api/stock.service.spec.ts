import {TestBed} from '@angular/core/testing';

import {StockService} from '@core/services';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFireFunctions} from '@angular/fire/compat/functions';

describe('SupplyService', () => {
    let service: StockService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [
                AngularFireFunctions
            ]
        });
        service = TestBed.inject(StockService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
