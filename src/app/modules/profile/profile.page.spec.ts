import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProfilePage} from './profile.page';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {TranslationModule} from '../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('ProfilePage', () => {
    let component: ProfilePage;
    let fixture: ComponentFixture<ProfilePage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProfilePage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions, navControllerMock]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfilePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
