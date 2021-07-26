import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SettlementDetailComponent} from './settlement-detail.component';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../../../translation.module';
import {HttpClientModule} from '@angular/common/http';

describe('SettlementDetailComponent', () => {
    let component: SettlementDetailComponent;
    let fixture: ComponentFixture<SettlementDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettlementDetailComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AngularFirestore]
        }).compileComponents();

        fixture = TestBed.createComponent(SettlementDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
