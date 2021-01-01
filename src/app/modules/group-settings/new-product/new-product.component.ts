import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProductService} from '../../../core/services/product.service';
import {LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {GroupService} from '../../../core/services/group.service';
import {Group} from '../../../core/models';
import {Subscription} from 'rxjs';
import {Location} from '@angular/common';

@Component({
    selector: 'app-new-product',
    templateUrl: './new-product.component.html',
    styleUrls: ['./new-product.component.scss'],
})
export class NewProductComponent implements OnInit, OnDestroy {
    productForm: FormGroup;
    isSubmitted: boolean;
    groupCreated: boolean;

    groupId: string;
    private group: Group;
    private groupSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private groupService: GroupService) {
        this.productForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            price: ['', [Validators.required, Validators.min(0), Validators.max(100000)]]
        });

        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;
                });
        });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    get form() {
        return this.productForm.controls;
    }

    amountChanged($event: number) {
        this.form.price.setValue($event);
    }

    async addProduct() {
        this.isSubmitted = true;

        if (this.form.name.value.length < 3) {
            this.form.name.setErrors({
                length: true
            });
        }

        if (this.group.products.find(product => product.name === this.form.name.value)) {
            this.form.name.setErrors({
                conflict: true
            });
        }

        if (this.productForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.adding'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        let isSuccessful = false;
        this.productService
            .addProduct(this.group, this.form.name.value, this.form.price.value)
            .then(() => {
                isSuccessful = true;
            })
            .finally(() => {
                loading.dismiss();

                if (isSuccessful) {
                    this.location.back();
                }
            });
    }
}
