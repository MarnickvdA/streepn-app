import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {House, Product} from '@core/models';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {AuthService, HouseService, ProductService} from '@core/services';
import {MoneyInputComponent} from '@shared/components/money-input/money-input.component';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.page.html',
    styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MoneyInputComponent) moneyInput: MoneyInputComponent;

    newName: string;
    newPrice: number;
    houseId: string;
    productId: string;
    product: Product;
    isAdmin: boolean;
    statisticItems: {
        accountName: string;
        totalIn: number;
        totalOut: number;
        amountIn: number;
        amountOut: number;
    }[] = [];
    private house: House;
    private houseSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private houseService: HouseService,
                private alertController: AlertController,
                private authService: AuthService,
                private navController: NavController) {
        this.route.params.subscribe((params: Params) => {
            this.productId = params.productId;
        });
    }

    get uniqueName() {
        return this.house.products.find(p => p.name === this.newName) === undefined;
    }

    ngOnInit() {
        this.houseId = this.houseService.currentHouseId;
        this.houseSub = this.houseService.observeHouse(this.houseId)
            .subscribe(house => {
                this.house = house;

                if (house) {
                    const product = house.products.find(p => p.id === this.productId);
                    if (product) {
                        this.product = product;
                        this.newName = this.product.name;
                        this.moneyInput?.setAmount(this.product?.price);
                        this.isAdmin = house.isAdmin(this.authService.currentUser.uid);

                        this.generateStatistics(house, product);
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.moneyInput?.setAmount(this.product?.price);
    }

    async removeProduct() {
        const alert = await this.alertController.create({
            header: this.translate.instant('house.overview.editProduct.deleteWarning.header'),
            message: this.translate.instant('house.overview.editProduct.deleteWarning.message', {name: this.product.name}),
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

                        this.productService.removeProduct(this.house, this.product)
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

    private generateStatistics(house: House, product: Product) {
        const items = [];
        house.allAccounts.forEach((acc) => {
            const productItem = acc.balance.products[product.id];

            items.push({
                accountName: acc.name,
                totalIn: productItem?.totalIn ?? 0,
                totalOut: productItem?.totalOut ?? 0,
                amountIn: productItem?.amountIn ?? 0,
                amountOut: productItem?.amountOut ?? 0,
            });
        });

        this.statisticItems = items;
    }

    private async editProduct(product: Product) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.productService
            .editProduct(this.house, product)
            .finally(() => {
                loading.dismiss();
            });
    }
}

