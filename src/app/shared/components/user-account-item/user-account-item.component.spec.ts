import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {UserAccountItemComponent} from './user-account-item.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {RouterTestingModule} from '@angular/router/testing';
import {UserAccount, UserRole} from '@core/models';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../translation.module';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireFunctions} from '@angular/fire/functions';

describe('UserAccountItemComponent', () => {
    let component: UserAccountItemComponent;
    let fixture: ComponentFixture<UserAccountItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [UserAccountItemComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), SharedModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireAuth, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(UserAccountItemComponent);
        component = fixture.componentInstance;
        component.account = UserAccount.new('', '', 'Test', [UserRole.admin], undefined);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
