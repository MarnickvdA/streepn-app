import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {environment} from '@env/environment.test';
import {SharedModule} from '@shared/shared.module';
import {TranslationModule} from '../../../../../translation.module';
import {SettleSharedAccountComponent} from './settle-shared-account.component';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('SettleComponent', () => {
    let component: SettleSharedAccountComponent;
    let fixture: ComponentFixture<SettleSharedAccountComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettleSharedAccountComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(),
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions,]
        }).compileComponents();

        fixture = TestBed.createComponent(SettleSharedAccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
