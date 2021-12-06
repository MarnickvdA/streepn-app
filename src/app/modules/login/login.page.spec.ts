import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {LoginPage} from './login.page';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {TranslationModule} from '../../translation.module';
import {SharedModule} from '@shared/shared.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('LoginPage', () => {
    let component: LoginPage;
    let fixture: ComponentFixture<LoginPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LoginPage],
            imports: [
                IonicModule.forRoot(),
                TranslationModule.forRoot(),
                SharedModule.forRoot(),
                RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,
                navControllerMock,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
