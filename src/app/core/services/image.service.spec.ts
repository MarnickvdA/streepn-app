import {TestBed} from '@angular/core/testing';

import {ImageService} from './image.service';
import {IonicModule} from '@ionic/angular';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Auth} from '@angular/fire/auth';

describe('ImageService', () => {
    let service: ImageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Auth]
        });
        service = TestBed.inject(ImageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
