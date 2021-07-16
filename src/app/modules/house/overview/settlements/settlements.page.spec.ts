import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SettlementsPage} from './settlements.page';

describe('SettlementsPage', () => {
    let component: SettlementsPage;
    let fixture: ComponentFixture<SettlementsPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SettlementsPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SettlementsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
