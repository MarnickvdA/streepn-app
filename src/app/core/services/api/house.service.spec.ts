import {TestBed} from '@angular/core/testing';

import {HouseService} from '@core/services';
import {environment} from '@env/environment.test';
import {IonicModule} from '@ionic/angular';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Functions} from '@angular/fire/functions';
import {Performance} from '@angular/fire/performance';

describe('HouseService', () => {
    let service: HouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                IonicModule.forRoot(),
                TranslationModule.forRoot(),
                HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
            ],
            providers: [Firestore, Functions, Performance]
        });
        service = TestBed.inject(HouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
