import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TransactionItemComponent} from './transaction-item.component';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {SharedModule} from '@shared/shared.module';
import {Transaction} from '@core/models';
import {TranslationModule} from '../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore, Timestamp} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('TransactionItemComponent', () => {
    let component: TransactionItemComponent;
    let fixture: ComponentFixture<TransactionItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionItemComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock]
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionItemComponent);
        component = fixture.componentInstance;
        component.transaction = new Transaction('', Timestamp.now(), '', [], false);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
