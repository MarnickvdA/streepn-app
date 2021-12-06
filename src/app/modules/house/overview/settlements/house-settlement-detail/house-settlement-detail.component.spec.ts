import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {HouseSettlementDetailComponent} from './house-settlement-detail.component';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('SettlementDetailComponent', () => {
    let component: HouseSettlementDetailComponent;
    let fixture: ComponentFixture<HouseSettlementDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HouseSettlementDetailComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(HouseSettlementDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
