import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {UserAccountItemComponent} from './user-account-item.component';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {UserAccount, UserRole} from '@core/models';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('UserAccountItemComponent', () => {
    let component: UserAccountItemComponent;
    let fixture: ComponentFixture<UserAccountItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [UserAccountItemComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), SharedModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
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
