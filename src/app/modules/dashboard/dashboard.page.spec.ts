import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {DashboardPage} from './dashboard.page';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireAuth} from '@angular/fire/auth';
import {ionRouterOutletMock} from '@core/mocks/ion-router-outlet.mock';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../translation.module';

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
                AngularFireModule.initializeApp(environment.firebaseConfig),
                RouterTestingModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                navControllerMock,
                AngularFireAuth,
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
