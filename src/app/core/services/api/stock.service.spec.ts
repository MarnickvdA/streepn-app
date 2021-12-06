import {TestBed} from '@angular/core/testing';

import {StockService} from './stock.service';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFireFunctions} from '@angular/fire/functions';

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
