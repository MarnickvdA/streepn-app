import {Component, Input, OnInit} from '@angular/core';
import {Product} from '@core/models';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-product-item',
    templateUrl: './product-item.component.html',
    styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent implements OnInit {

    @Input() product: Product;
    @Input() canEdit = false;

    constructor(private formBuilder: FormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private navController: NavController) {
    }

    ngOnInit() {
    }

    editProduct() {
        if (this.canEdit) {
            this.navController.navigateForward(['products', this.product.id], {relativeTo: this.route});
        }
    }
}
