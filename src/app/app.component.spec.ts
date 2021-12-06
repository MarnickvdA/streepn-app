import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';

import {Platform} from '@ionic/angular';
import {AppComponent} from './app.component';
import {RouterTestingModule} from '@angular/router/testing';
import {navControllerMock} from '@core/mocks/nav-controller.mock';
import {TranslationModule} from './translation.module';
import {SharedModule} from '@shared/shared.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '@env/environment.test';
import {AngularFireAuth} from '@angular/fire/auth';

describe('AppComponent', () => {

    let platformReadySpy;
    let platformSpy;

    beforeEach(waitForAsync(() => {
        platformReadySpy = Promise.resolve();
        platformSpy = jasmine.createSpyObj('Platform', {ready: platformReadySpy});

        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [
                RouterTestingModule,
                TranslationModule.forRoot(),
                SharedModule.forRoot(),
                AngularFireModule.initializeApp(environment.firebaseConfig)
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: Platform, useValue: platformSpy},
                navControllerMock,
                AngularFireAuth
            ],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should initialize the app', async () => {
        TestBed.createComponent(AppComponent);
        expect(platformSpy.ready).toHaveBeenCalled();
        await platformReadySpy;
    });
});
