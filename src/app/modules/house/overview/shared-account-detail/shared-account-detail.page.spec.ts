import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SharedAccountDetailPage} from './shared-account-detail.page';
import {SharedModule} from '@shared/shared.module';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {TranslationModule} from '../../../../translation.module';
import {AngularFireFunctions} from '@angular/fire/compat/functions';

describe('SharedAccountDetailPage', () => {
    let component: SharedAccountDetailPage;
    let fixture: ComponentFixture<SharedAccountDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SharedAccountDetailPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig)],
            providers: [navControllerMock, AngularFirestore, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(SharedAccountDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
