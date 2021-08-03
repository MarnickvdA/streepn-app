import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProductDetailPage} from './product-detail.page';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/firestore';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslationModule} from '../../../../translation.module';
import {AngularFireFunctions} from '@angular/fire/functions';

describe('ProductDetailPage', () => {
    let component: ProductDetailPage;
    let fixture: ComponentFixture<ProductDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductDetailPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
