import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SharedAccountItemComponent} from './shared-account-item.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {SharedAccount} from '@core/models';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../translation.module';

describe('SharedAccountItemComponent', () => {
    let component: SharedAccountItemComponent;
    let fixture: ComponentFixture<SharedAccountItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SharedAccountItemComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), SharedModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
        }).compileComponents();

        fixture = TestBed.createComponent(SharedAccountItemComponent);
        component = fixture.componentInstance;
        component.account = SharedAccount.new('SharedAccountTest');
        component.canEditAccount = true;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
