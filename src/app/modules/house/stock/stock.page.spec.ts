import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {StockPage} from './stock.page';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('StockPage', () => {
    let component: StockPage;
    let fixture: ComponentFixture<StockPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StockPage],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(StockPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
