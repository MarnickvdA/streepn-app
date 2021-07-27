import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProductStockItemComponent} from './product-stock-item.component';
import {Product} from '@core/models';

describe('SupplyItemComponent', () => {
    let component: ProductStockItemComponent;
    let fixture: ComponentFixture<ProductStockItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductStockItemComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductStockItemComponent);
        component = fixture.componentInstance;
        component.product = Product.new('Beer', 50);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
