import {TestBed} from '@angular/core/testing';

import {AuthService} from './auth.service';
import {IonicModule} from '@ionic/angular';
import {SharedModule} from '@shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Auth} from '@angular/fire/auth';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig))],
            providers: [Auth]
        });
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
