import {TestBed} from '@angular/core/testing';
import {ProductService} from '@core/services';
import {environment} from '@env/environment.test';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';

describe('ProductsService', () => {
    let service: ProductService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
            ],
            providers: [Firestore]
        });
        service = TestBed.inject(ProductService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
