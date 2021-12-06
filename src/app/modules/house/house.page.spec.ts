import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {HousePage} from './house.page';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {Firestore} from '@angular/fire/firestore';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';

describe('HousePage', () => {
    let component: HousePage;
    let fixture: ComponentFixture<HousePage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HousePage],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [navControllerMock, Firestore],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(HousePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
