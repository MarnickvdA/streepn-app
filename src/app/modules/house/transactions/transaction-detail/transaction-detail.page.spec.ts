import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TransactionDetailPage} from './transaction-detail.page';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('TransactionDetailPage', () => {
    let component: TransactionDetailPage;
    let fixture: ComponentFixture<TransactionDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionDetailPage],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule, HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
