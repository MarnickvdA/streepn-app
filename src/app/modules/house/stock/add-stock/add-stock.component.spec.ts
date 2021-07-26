import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddStockComponent} from './add-stock.component';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {RouterTestingModule} from '@angular/router/testing';
import {House} from '@core/models';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../../translation.module';

describe('AddStockComponent', () => {
    let component: AddStockComponent;
    let fixture: ComponentFixture<AddStockComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AddStockComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore]
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
