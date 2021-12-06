import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewHouseComponent} from './new-house.component';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';

describe('NewHouseComponent', () => {
    let component: NewHouseComponent;
    let fixture: ComponentFixture<NewHouseComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewHouseComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [
                navControllerMock,
                Firestore
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
