import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {House} from '@core/models';
import {Observable, Subscription} from 'rxjs';
import {ProductService} from '@core/services';

@Component({
    selector: 'app-new-product',
    templateUrl: './new-product.component.html',
    styleUrls: ['./new-product.component.scss'],
})
export class NewProductComponent implements OnInit, OnDestroy {
    @Input()
    house$: Observable<House>;

    productForm: FormGroup;
    isSubmitted: boolean;
    houseCreated: boolean;

    private house: House;
    private houseSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private translate: TranslateService) {
        this.productForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            price: ['', [Validators.required, Validators.min(0), Validators.max(100000)]]
        });
    }

    get form() {
        return this.productForm.controls;
    }

    ngOnInit() {
        this.houseSub = this.house$.subscribe(house => {
            this.house = house;
        });
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
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

        if (this.house.products.find(product => product.name === this.form.name.value)) {
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
            .addProduct(this.house, this.form.name.value, this.form.price.value)
            .then(() => {
                isSuccessful = true;
            })
            .finally(() => {
                loading.dismiss();

                if (isSuccessful) {
                    this.dismiss();
                }
            });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
