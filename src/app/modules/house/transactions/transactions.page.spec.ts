import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TransactionsPage} from './transactions.page';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {AngularFireAuth} from '@angular/fire/compat/auth';

describe('TransactionsPage', () => {
    let component: TransactionsPage;
    let fixture: ComponentFixture<TransactionsPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionsPage],
            imports: [IonicModule.forRoot(), RouterTestingModule, TranslationModule.forRoot(), HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig)],
            providers: [AngularFirestore, AngularFireFunctions, AngularFireAuth],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
