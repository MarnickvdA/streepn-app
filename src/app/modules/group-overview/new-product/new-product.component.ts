import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProductService} from '../../../core/services/product.service';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Group} from '../../../core/models';
import {Observable, Subscription} from 'rxjs';

@Component({
    selector: 'app-new-product',
    templateUrl: './new-product.component.html',
    styleUrls: ['./new-product.component.scss'],
})
export class NewProductComponent implements OnInit, OnDestroy {
    productForm: FormGroup;
    isSubmitted: boolean;
    groupCreated: boolean;

    @Input() group$: Observable<Group>;

    private group: Group;
    private groupSub: Subscription;

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
        this.groupSub = this.group$.subscribe(group => {
            this.group = group;
        });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
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
                    this.dismiss();
                }
            });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
