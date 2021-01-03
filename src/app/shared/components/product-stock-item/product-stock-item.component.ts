import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../../../core/models';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-product-stock-item',
    templateUrl: './product-stock-item.component.html',
    styleUrls: ['./product-stock-item.component.scss'],
})
export class ProductStockItemComponent implements OnInit {

    @Input() product: Product;
    @Input() canEdit = false;

    constructor(private formBuilder: FormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private navController: NavController) {
    }

    ngOnInit() {
    }

    editProductStockItem() {
        if (this.canEdit) {
            // this.navController.navigateForward(['supplies', this.product.id], {relativeTo: this.route});
        }
    }
}
