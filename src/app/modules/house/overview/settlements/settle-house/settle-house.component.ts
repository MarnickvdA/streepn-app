import {Component, OnDestroy, OnInit} from '@angular/core';
import {House, SharedAccount} from '@core/models';
import {EventsService, HouseService, LoggerService} from '@core/services';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {LoadingController, ModalController} from '@ionic/angular';
import {SettleComponent} from '@modules/house/overview/shared-account-detail/settle/settle.component';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faCheckCircle, faPlusCircle, faTimesCircle} from '@fortawesome/pro-duotone-svg-icons';
import {AddStockComponent} from '@modules/house/stock/add-stock/add-stock.component';
import {TranslateService} from '@ngx-translate/core';
import {catchError} from 'rxjs/operators';
import {SettlementService} from '@core/services/settlement.service';

@Component({
    selector: 'app-settle-house',
    templateUrl: './settle-house.component.html',
    styleUrls: ['./settle-house.component.scss'],
})
export class SettleHouseComponent implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(SettleHouseComponent.name);

    house?: House;
    private houseSub: Subscription;
    private house$: Observable<House>;

    constructor(private houseService: HouseService,
                private settlementService: SettlementService,
                private modalController: ModalController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private events: EventsService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faCheckCircle, faTimesCircle, faPlusCircle);
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe(house => {
                this.house = house;
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    settleSharedAccount(account: SharedAccount) {
        this.modalController.create({
            component: SettleComponent,
            componentProps: {
                sharedAccountId: account.id
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    dismiss() {
        this.modalController.dismiss();
    }

    async settleHouse() {
        if (!this.house?.isSettleable) {
            this.logger.error({
                message: 'Cannot settle house, conditions not met!'
            });
        } else {
            const loading = await this.loadingController.create({
                message: this.translate.instant('actions.settling'),
                translucent: true,
                backdropDismiss: false
            });

            await loading.present();

            this.settlementService.settleHouse(this.house)
                .pipe(
                    catchError(err => {
                        this.logger.error({message: err});
                        loading.dismiss();
                        return EMPTY;
                    })
                )
                .subscribe(() => {
                    this.events.publish('house:settlement');
                    loading.dismiss();
                    this.dismiss();
                });
        }
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
}
