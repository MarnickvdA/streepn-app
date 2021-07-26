import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ProductItemComponent} from './product-item.component';
import {SharedModule} from '@shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {Product} from '@core/models';

describe('ProductItemComponent', () => {
    let component: ProductItemComponent;
    let fixture: ComponentFixture<ProductItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductItemComponent],
            imports: [IonicModule.forRoot(), SharedModule.forRoot(), RouterTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductItemComponent);
        component = fixture.componentInstance;
        component.product = Product.new('Test', 10);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
