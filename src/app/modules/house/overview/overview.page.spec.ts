import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {OverviewPage} from './overview.page';
import {SharedModule} from '@shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {environment} from '@env/environment.test';
import {TranslationModule} from '../../../translation.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {Firestore} from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import {Functions} from '@angular/fire/functions';

describe('HouseOverviewPage', () => {
    let component: OverviewPage;
    let fixture: ComponentFixture<OverviewPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OverviewPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),],
            providers: [Firestore, Auth, Functions]
        }).compileComponents();

        fixture = TestBed.createComponent(OverviewPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
