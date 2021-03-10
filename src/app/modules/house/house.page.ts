import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {EventsService, HouseService} from '@core/services';
import {House} from '@core/models';
import {AddTransactionComponent} from '@modules/house/add-transaction/add-transaction.component';
import {ModalController, NavController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';
import {faPlus} from '@fortawesome/pro-regular-svg-icons';
import {faCogs, faHouse, faInventory, faReceipt} from '@fortawesome/pro-duotone-svg-icons';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-house',
    templateUrl: './house.page.html',
    styleUrls: ['./house.page.scss'],
})
export class HousePage implements OnInit, OnDestroy {

    house$: Observable<House>;
    private routeSub: Subscription;
    iOS: boolean;
    private house: House;
    private houseSub: Subscription;

    constructor(private route: ActivatedRoute,
                private houseService: HouseService,
                private modalController: ModalController,
                private events: EventsService,
                private library: FaIconLibrary,
                private navController: NavController) {
        this.library.addIcons(faPlus, faHouse, faReceipt, faInventory, faCogs);
        this.iOS = Capacitor.isNative && Capacitor.platform === 'ios';
    }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.houseService.currentHouseId = params.id;
            this.house$ = this.houseService.observeHouse(params.id);

            this.houseSub = this.house$.subscribe((house) => {
                this.house = house;
            });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.houseSub.unsubscribe();
    }

    addTransaction() {
        this.modalController.create({
            component: AddTransactionComponent,
            componentProps: {
                house$: this.house$
            },
            swipeToClose: true,
        }).then((modal) => {
            modal.present();
            modal.onWillDismiss()
                .then((callback) => {
                    if (callback.data) {
                        this.events.publish('transactions:update');
                        this.navController.navigateRoot(['house', this.house?.id, 'transactions']);
                    }
                });
        });
    }
}