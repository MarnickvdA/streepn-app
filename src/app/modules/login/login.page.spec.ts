import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {LoginPage} from './login.page';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {AngularFireAuth} from '@angular/fire/auth';
import {TranslationModule} from '../../translation.module';
import {SharedModule} from '@shared/shared.module';

describe('LoginPage', () => {
    let component: LoginPage;
    let fixture: ComponentFixture<LoginPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LoginPage],
            imports: [
                IonicModule.forRoot(),
                TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),
                SharedModule.forRoot(),
                RouterTestingModule,
            ],
            providers: [
                navControllerMock,
                AngularFireAuth
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
