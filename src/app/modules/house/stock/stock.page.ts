import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddStockComponent} from '@modules/house/stock/add-stock/add-stock.component';
import {ModalController} from '@ionic/angular';
import {AuthService, HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House, Product} from '@core/models';
import {NewProductComponent} from '@modules/house/stock/new-product/new-product.component';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {dashboardPageGuide, stockPageGuide} from '@shared/app-guides';

@Component({
    selector: 'app-house-stock',
    templateUrl: './stock.page.html',
    styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit, OnDestroy {

    house: House;
    stockProducts: Product[];
    isAdmin: boolean;

    private house$: Observable<House>;
    private houseSub: Subscription;

    constructor(private modalController: ModalController,
                private houseService: HouseService,
                private authService: AuthService) {
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

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'house.stock.title',
            stockPageGuide
        );
    }
}
