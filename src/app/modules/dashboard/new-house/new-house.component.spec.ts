import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewHouseComponent} from './new-house.component';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {TranslationModule} from '../../../translation.module';

describe('NewHouseComponent', () => {
    let component: NewHouseComponent;
    let fixture: ComponentFixture<NewHouseComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewHouseComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig)],
            providers: [
                navControllerMock,
                AngularFirestore
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NewHouseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
