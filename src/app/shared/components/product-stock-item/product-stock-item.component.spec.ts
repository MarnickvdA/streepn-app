import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProductStockItemComponent} from './supply-item.component';

describe('SupplyItemComponent', () => {
    let component: ProductStockItemComponent;
    let fixture: ComponentFixture<ProductStockItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductStockItemComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductStockItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
