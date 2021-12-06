import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SharedAccountDetailPage} from './shared-account-detail.page';
import {SharedModule} from '@shared/shared.module';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('SharedAccountDetailPage', () => {
    let component: SharedAccountDetailPage;
    let fixture: ComponentFixture<SharedAccountDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SharedAccountDetailPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock]
        }).compileComponents();

        fixture = TestBed.createComponent(SharedAccountDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
