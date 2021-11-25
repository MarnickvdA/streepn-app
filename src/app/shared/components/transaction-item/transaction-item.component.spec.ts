import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TransactionItemComponent} from './transaction-item.component';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {SharedModule} from '@shared/shared.module';
import {Transaction} from '@core/models';
import {TranslationModule} from '../../../translation.module';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

describe('TransactionItemComponent', () => {
    let component: TransactionItemComponent;
    let fixture: ComponentFixture<TransactionItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionItemComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [
                navControllerMock,
                AngularFirestore,
                AngularFireAuth
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionItemComponent);
        component = fixture.componentInstance;
        component.transaction = new Transaction('', firebase.firestore.Timestamp.now(), '', [], false);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
