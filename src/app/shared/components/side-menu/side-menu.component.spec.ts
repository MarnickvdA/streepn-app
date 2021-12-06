import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SideMenuComponent} from './side-menu.component';
import {environment} from '@env/environment.test';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('SideMenuComponent', () => {
    let component: SideMenuComponent;
    let fixture: ComponentFixture<SideMenuComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SideMenuComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule, HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SideMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
