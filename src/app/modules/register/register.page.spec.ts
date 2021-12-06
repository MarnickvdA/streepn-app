import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {RegisterPage} from './register.page';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../translation.module';
import {SharedModule} from '@shared/shared.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('RegisterPage', () => {
    let component: RegisterPage;
    let fixture: ComponentFixture<RegisterPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RegisterPage],
            imports: [
                IonicModule.forRoot(),
                TranslationModule.forRoot(),
                SharedModule.forRoot(),
                RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
