import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {OnboardingComponent} from './onboarding.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../translation.module';
import {AngularFirestore} from '@angular/fire/firestore';

describe('OnboardingComponent', () => {
    let component: OnboardingComponent;
    let fixture: ComponentFixture<OnboardingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore]
        }).compileComponents();

        fixture = TestBed.createComponent(OnboardingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
