import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {OverviewPage} from './overview.page';
import {SharedModule} from '@shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFireAuth} from '@angular/fire/auth';
import {TranslationModule} from '../../../translation.module';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireFunctions} from '@angular/fire/functions';

describe('HouseOverviewPage', () => {
    let component: OverviewPage;
    let fixture: ComponentFixture<OverviewPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OverviewPage],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), TranslationModule.forRoot(), RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebaseConfig),],
            providers: [AngularFirestore, AngularFireAuth, AngularFireFunctions]
        }).compileComponents();

        fixture = TestBed.createComponent(OverviewPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
