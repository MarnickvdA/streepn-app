import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {EventsService, HouseService} from '@core/services';
import {House} from '@core/models';
import {AddTransactionComponent} from '@modules/house/add-transaction/add-transaction.component';
import {ModalController, NavController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';

@Component({
    selector: 'app-house',
    templateUrl: './house.page.html',
    styleUrls: ['./house.page.scss'],
})
export class HousePage implements OnInit, OnDestroy {

    house$: Observable<House>;
    iOS: boolean;
    private routeSub: Subscription;
    private house: House;
    private houseSub: Subscription;

    constructor(private route: ActivatedRoute,
                private houseService: HouseService,
                private modalController: ModalController,
                private events: EventsService,
                private navController: NavController) {
        this.iOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
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

    tabsChange($event: { tab: string }) {
        if (this.house) {
            this.navController.navigateRoot(['house', this.house.id, $event.tab]);
        }
    }
}
