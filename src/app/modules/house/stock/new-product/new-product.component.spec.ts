import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewProductComponent} from './new-product.component';
import {SharedModule} from '@shared/shared.module';
import {environment} from '@env/environment.test';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('NewProductComponent', () => {
    let component: NewProductComponent;
    let fixture: ComponentFixture<NewProductComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewProductComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(NewProductComponent);
        component = fixture.componentInstance;
        component.house$ = new Observable();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
