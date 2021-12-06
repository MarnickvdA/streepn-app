import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {StockLogPage} from './stock-log.page';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('StockLogPage', () => {
    let component: StockLogPage;
    let fixture: ComponentFixture<StockLogPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StockLogPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(StockLogPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
