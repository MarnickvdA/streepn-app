import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProfilePage} from './profile.page';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {TranslationModule} from '../../translation.module';

describe('ProfilePage', () => {
    let component: ProfilePage;
    let fixture: ComponentFixture<ProfilePage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProfilePage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFireAuth, navControllerMock]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfilePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
