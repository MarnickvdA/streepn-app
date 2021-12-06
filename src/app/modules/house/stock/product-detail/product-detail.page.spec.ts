import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProductDetailPage} from './product-detail.page';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('ProductDetailPage', () => {
    let component: ProductDetailPage;
    let fixture: ComponentFixture<ProductDetailPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductDetailPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductDetailPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
