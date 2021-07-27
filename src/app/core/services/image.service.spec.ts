import {TestBed} from '@angular/core/testing';

import {ImageService} from './image.service';
import {IonicModule} from '@ionic/angular';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFireAuth} from '@angular/fire/auth';
import {TranslationModule} from '../../translation.module';

describe('ImageService', () => {
    let service: ImageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFireAuth]
        });
        service = TestBed.inject(ImageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
