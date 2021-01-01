import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../../../core/models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-product-item',
    templateUrl: './product-item.component.html',
    styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent implements OnInit {

    @Input() product: Product;
    groupForm: FormGroup;
    isSubmitted: boolean;
    loading: boolean;

    constructor(private formBuilder: FormBuilder) {
        this.groupForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            price: ['', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
    }

}
