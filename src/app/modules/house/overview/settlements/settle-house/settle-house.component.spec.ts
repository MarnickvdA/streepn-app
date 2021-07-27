import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SettleHouseComponent} from './settle-house.component';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../../../../translation.module';

describe('SettleHouseComponent', () => {
    let component: SettleHouseComponent;
    let fixture: ComponentFixture<SettleHouseComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettleHouseComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),]
        }).compileComponents();

        fixture = TestBed.createComponent(SettleHouseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
