import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewSharedAccountComponent} from './new-shared-account.component';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {Observable} from 'rxjs';
import {House} from '@core/models';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('NewSharedAccountComponent', () => {
    let component: NewSharedAccountComponent;
    let fixture: ComponentFixture<NewSharedAccountComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewSharedAccountComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions]
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
