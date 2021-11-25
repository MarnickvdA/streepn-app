import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {NewProductComponent} from './new-product.component';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '@env/environment.test';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {TranslationModule} from '../../../../translation.module';

describe('NewProductComponent', () => {
    let component: NewProductComponent;
    let fixture: ComponentFixture<NewProductComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewProductComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore]
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
