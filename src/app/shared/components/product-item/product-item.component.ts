import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../../../core/models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
    groupForm: FormGroup;
    isSubmitted: boolean;
    loading: boolean;

    constructor(private formBuilder: FormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private navController: NavController) {
        this.groupForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            price: ['', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
    }

    editProduct() {
        this.navController.navigateForward(['products', this.product.id], {relativeTo: this.route});
    }
}
