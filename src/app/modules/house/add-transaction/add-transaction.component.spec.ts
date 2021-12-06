import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddTransactionComponent} from './add-transaction.component';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {House} from '@core/models';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';

describe('AddTransactionComponent', () => {
    let component: AddTransactionComponent;
    let fixture: ComponentFixture<AddTransactionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AddTransactionComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [Firestore]
        }).compileComponents();

        fixture = TestBed.createComponent(AddTransactionComponent);
        component = fixture.componentInstance;
        component.house$ = new Observable<House>();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
