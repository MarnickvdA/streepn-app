import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddStockComponent} from '@modules/house/stock/add-stock/add-stock.component';
import {ModalController} from '@ionic/angular';
import {AuthService, HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House, Product} from '@core/models';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faEdit, faHistory} from '@fortawesome/pro-duotone-svg-icons';
import {NewProductComponent} from '@modules/house/stock/new-product/new-product.component';

@Component({
    selector: 'app-house-stock',
    templateUrl: './stock.page.html',
    styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit, OnDestroy {

    house: House;
    private house$: Observable<House>;
    private houseSub: Subscription;
    stockProducts: Product[];
    isAdmin: boolean;

    constructor(private modalController: ModalController,
                private houseService: HouseService,
                private iconLibrary: FaIconLibrary,
                private authService: AuthService) {
        this.iconLibrary.addIcons(faEdit, faHistory);
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe(house => {
                this.house = house;

                if (house) {
                    this.stockProducts = house.products.filter(p => !isNaN(p.stock));
                    this.isAdmin = house.isAdmin(this.authService.currentUser.uid);
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    addStock() {
        this.modalController.create({
            component: AddStockComponent,
            componentProps: {
                house$: this.house$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    addProduct() {
        this.modalController.create({
            component: NewProductComponent,
            componentProps: {
                house$: this.house$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }
}
