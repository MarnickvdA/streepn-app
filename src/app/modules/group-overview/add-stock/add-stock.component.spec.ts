import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddStockComponent} from './add-stock.component';

describe('AddStockComponent', () => {
    let component: AddStockComponent;
    let fixture: ComponentFixture<AddStockComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddStockComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AddStockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
