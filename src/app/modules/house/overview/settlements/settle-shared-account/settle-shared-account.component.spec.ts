import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../../../translation.module';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {SettleSharedAccountComponent} from './settle-shared-account.component';

describe('SettleComponent', () => {
    let component: SettleSharedAccountComponent;
    let fixture: ComponentFixture<SettleSharedAccountComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettleSharedAccountComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireFunctions, AngularFireAuth]
        }).compileComponents();

        fixture = TestBed.createComponent(SettleSharedAccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
