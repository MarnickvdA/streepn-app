import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group, Product} from '@core/models';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {MoneyInputComponent} from '@shared/components/money-input/money-input.component';
import {GroupService, ProductService} from '@core/services';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.page.html',
    styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy {

    @ViewChild(MoneyInputComponent) moneyInput: MoneyInputComponent;

    productForm: FormGroup;
    isSubmitted: boolean;
    groupCreated: boolean;

    groupId: string;
    productId: string;
    product: Product;
    private group: Group;
    private groupSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private groupService: GroupService,
                private alertController: AlertController) {
        this.productForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            price: ['', [Validators.required, Validators.min(0), Validators.max(100000)]]
        });

        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
            this.productId = params.productId;
            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;

                    if (group) {
                        const product = group.products.find(p => p.id === this.productId);
                        if (product) {
                            this.product = product;
                            this.productForm.controls.name.setValue(product.name);
                            this.moneyInput.handleInput(new CustomEvent('', {
                                detail: {
                                    data: product.price + ''
                                }
                            }));
                        }
                    }
                });
        });
    }

    get form() {
        return this.productForm.controls;
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    amountChanged($event: number) {
        this.form.price.setValue($event);
    }

    async editProduct() {
        this.isSubmitted = true;

        if (this.form.name.value.length < 3) {
            this.form.name.setErrors({
                length: true
            });
        }

        if (this.group.products.find(p => (p.name === this.form.name.value && p.id !== this.productId))) {
            this.form.name.setErrors({
                conflict: true
            });
        }

        if (this.productForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        const product = Object.create(this.product);
        product.name = this.form.name.value;
        product.price = this.form.price.value;

        let isSuccessful = false;
        this.productService
            .editProduct(this.group, product)
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

    async removeProduct() {
        const alert = await this.alertController.create({
            header: this.translate.instant('group.overview.editProduct.deleteWarning.header'),
            message: this.translate.instant('group.overview.editProduct.deleteWarning.message', {name: this.product.name}),
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel'
                }, {
                    text: this.translate.instant('actions.yes'),
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            backdropDismiss: false,
                            message: this.translate.instant('actions.deleting')
                        });

                        await loading.present();

                        let isSuccessful = false;
                        this.productService.removeProduct(this.group, this.product)
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
            ]
        });

        await alert.present();
    }
}

