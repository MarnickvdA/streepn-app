import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {InfoModalComponent} from './info-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslationModule} from '../../../translation.module';
import {HttpClientModule} from '@angular/common/http';

describe('InfoModalComponent', () => {
    let component: InfoModalComponent;
    let fixture: ComponentFixture<InfoModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [InfoModalComponent],
            imports: [IonicModule.forRoot(), TranslationModule.forRoot(), HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(InfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
