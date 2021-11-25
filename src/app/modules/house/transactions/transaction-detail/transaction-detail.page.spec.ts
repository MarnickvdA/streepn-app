import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TransactionDetailPage} from './transaction-detail.page';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {TranslationModule} from '../../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFireFunctions} from '@angular/fire/compat/functions';

describe('TransactionDetailPage', () => {
    let component: TransactionDetailPage;
    let fixture: ComponentFixture<TransactionDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionDetailPage],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule, HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig)],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AngularFirestore, AngularFireAuth, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
