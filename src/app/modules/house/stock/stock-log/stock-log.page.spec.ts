import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {StockLogPage} from './stock-log.page';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFireAuth} from '@angular/fire/auth';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslationModule} from '../../../../translation.module';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireFunctions} from '@angular/fire/functions';

describe('StockLogPage', () => {
    let component: StockLogPage;
    let fixture: ComponentFixture<StockLogPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StockLogPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFireAuth, AngularFirestore, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(StockLogPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
