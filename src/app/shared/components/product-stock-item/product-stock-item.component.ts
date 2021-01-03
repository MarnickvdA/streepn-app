import {Component, Input, OnInit} from '@angular/core';
import {Product} from '@core/models';

@Component({
    selector: 'app-product-stock-item',
    templateUrl: './product-stock-item.component.html',
    styleUrls: ['./product-stock-item.component.scss'],
})
export class ProductStockItemComponent implements OnInit {

    @Input() product: Product;
    @Input() canEdit = false;

    constructor() {
    }

    ngOnInit() {
    }

    editProductStockItem() {
        if (this.canEdit) {
            // this.navController.navigateForward(['supplies', this.product.id], {relativeTo: this.route});
        }
    }
}
