import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {EditStockComponent} from './edit-stock.component';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs';
import {House, Stock} from '@core/models';
import {TranslationModule} from '../../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('EditStockComponent', () => {
    let component: EditStockComponent;
    let fixture: ComponentFixture<EditStockComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [EditStockComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(EditStockComponent);
        component = fixture.componentInstance;
        component.stockItem = Stock.new('', '', '', 50, 4);
        component.house$ = new Observable<House>();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
