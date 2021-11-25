import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewSharedAccountComponent} from './new-shared-account.component';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {Observable} from 'rxjs';
import {House} from '@core/models';
import {TranslationModule} from '../../../../translation.module';

describe('NewSharedAccountComponent', () => {
    let component: NewSharedAccountComponent;
    let fixture: ComponentFixture<NewSharedAccountComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewSharedAccountComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),]
        }).compileComponents();

        fixture = TestBed.createComponent(NewSharedAccountComponent);
        component = fixture.componentInstance;
        component.house$ = new Observable<House>();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
