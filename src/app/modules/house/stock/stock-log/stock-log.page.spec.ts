import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {StockLogPage} from './stock-log.page';

describe('StockLogPage', () => {
    let component: StockLogPage;
    let fixture: ComponentFixture<StockLogPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StockLogPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(StockLogPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
