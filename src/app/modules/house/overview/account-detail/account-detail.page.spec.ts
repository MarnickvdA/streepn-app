import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AccountDetailPage} from './account-detail.page';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../../translation.module';
import {AngularFirestore} from '@angular/fire/compat/firestore';

describe('AccountDetailPage', () => {
    let component: AccountDetailPage;
    let fixture: ComponentFixture<AccountDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AccountDetailPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig)],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                navControllerMock,
                AngularFirestore
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AccountDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
