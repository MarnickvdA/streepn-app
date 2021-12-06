import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {DealsPage} from './deals.page';
import {environment} from '@env/environment.test';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Functions} from '@angular/fire/functions';

describe('DealsPage', () => {
    let component: DealsPage;
    let fixture: ComponentFixture<DealsPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DealsPage],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), HttpClientModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [Firestore, Functions]
        }).compileComponents();

        fixture = TestBed.createComponent(DealsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
