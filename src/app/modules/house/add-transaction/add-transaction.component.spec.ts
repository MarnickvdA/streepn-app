import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddTransactionComponent} from './add-transaction.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {House} from '@core/models';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../translation.module';
import {AngularFirestore} from '@angular/fire/firestore';
import {HttpClientModule} from '@angular/common/http';

describe('AddTransactionComponent', () => {
    let component: AddTransactionComponent;
    let fixture: ComponentFixture<AddTransactionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AddTransactionComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), HttpClientModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AngularFirestore]
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
