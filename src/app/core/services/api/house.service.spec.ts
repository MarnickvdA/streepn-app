import {TestBed} from '@angular/core/testing';

import {HouseService} from '@core/services';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirePerformance} from '@angular/fire/performance';
import {IonicModule} from '@ionic/angular';
import {TranslationModule} from '../../../translation.module';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientModule} from '@angular/common/http';

describe('HouseService', () => {
    let service: HouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireFunctions, AngularFirePerformance]
        });
        service = TestBed.inject(HouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
