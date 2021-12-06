import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddStockComponent} from './add-stock.component';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {House} from '@core/models';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('AddStockComponent', () => {
    let component: AddStockComponent;
    let fixture: ComponentFixture<AddStockComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AddStockComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(AddStockComponent);
        component = fixture.componentInstance;
        component.house$ = new Observable<House>();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
