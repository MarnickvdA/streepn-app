import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SettleSharedAccount} from './settle-shared-account.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../../../translation.module';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFireAuth} from '@angular/fire/auth';

describe('SettleComponent', () => {
    let component: SettleSharedAccount;
    let fixture: ComponentFixture<SettleSharedAccount>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettleSharedAccount],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireFunctions, AngularFireAuth]
        }).compileComponents();

        fixture = TestBed.createComponent(SettleSharedAccount);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
