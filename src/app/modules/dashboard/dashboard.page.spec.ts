import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {DashboardPage} from './dashboard.page';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {ionRouterOutletMock} from '@core/mocks/ion-router-outlet.mock';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Auth} from '@angular/fire/auth';

describe('DashboardPage', () => {
    let component: DashboardPage;
    let fixture: ComponentFixture<DashboardPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardPage],
            imports: [
                IonicModule.forRoot(),
                SharedModule.forRoot(),
                TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
                RouterTestingModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                navControllerMock,
                Auth,
                ionRouterOutletMock
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
