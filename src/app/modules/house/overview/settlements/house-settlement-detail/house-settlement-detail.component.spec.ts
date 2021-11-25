import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {HouseSettlementDetailComponent} from './house-settlement-detail.component';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../../../translation.module';
import {HttpClientModule} from '@angular/common/http';

describe('SettlementDetailComponent', () => {
    let component: HouseSettlementDetailComponent;
    let fixture: ComponentFixture<HouseSettlementDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HouseSettlementDetailComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AngularFirestore]
        }).compileComponents();

        fixture = TestBed.createComponent(HouseSettlementDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
