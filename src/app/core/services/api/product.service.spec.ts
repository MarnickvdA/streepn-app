import {TestBed} from '@angular/core/testing';
import {ProductService} from '@core/services';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';

describe('ProductsService', () => {
    let service: ProductService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore]
        });
        service = TestBed.inject(ProductService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
