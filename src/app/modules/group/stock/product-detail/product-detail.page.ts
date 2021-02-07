import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Group, Product} from '@core/models';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {GroupService, ProductService} from '@core/services';
import {MoneyInputComponent} from '@shared/components/money-input/money-input.component';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faBoxFull, faEdit, faTag, faTrashAlt} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.page.html',
    styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MoneyInputComponent) moneyInput: MoneyInputComponent;

    newName: string;
    newPrice: number;
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
                private alertController: AlertController,
                private navController: NavController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faEdit, faTag, faTrashAlt, faBoxFull);

        this.route.params.subscribe((params: Params) => {
            this.productId = params.productId;
        });
    }

    ngOnInit() {
        this.groupId = this.groupService.currentGroupId;
        this.groupSub = this.groupService.observeGroup(this.groupId)
            .subscribe(group => {
                this.group = group;

                if (group) {
                    const product = group.products.find(p => p.id === this.productId);
                    if (product) {
                        this.product = product;
                        this.newName = this.product.name;
                        this.moneyInput?.setAmount(this.product?.price);
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.moneyInput?.setAmount(this.product?.price);
    }

    private async editProduct(product: Product) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.productService
            .editProduct(this.group, product)
            .finally(() => {
                loading.dismiss();
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

                        this.productService.removeProduct(this.group, this.product)
                            .then(() => {
                                this.navController.pop();
                            })
                            .finally(() => {
                                loading.dismiss();
                            });
                    }
                }
            ]
        });

        await alert.present();
    }

    get uniqueName() {
        return this.group.products.find(p => p.name === this.newName) === undefined;
    }

    async setName() {
        const product = this.product.deepCopy();
        product.name = this.newName;

        await this.editProduct(product);
    }

    async setPrice() {
        const product = this.product.deepCopy();
        product.price = this.newPrice;

        await this.editProduct(product);
    }

    amountChanged($event: number) {
        this.newPrice = $event;
    }
}

