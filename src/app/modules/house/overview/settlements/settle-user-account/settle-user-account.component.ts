import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {House, SharedAccount, UserAccount} from '@core/models';
import {Observable, Subscription} from 'rxjs';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {HouseService} from '@core/services';
import {SettlementService} from '@core/services/api/settlement.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-settle-user-account',
    templateUrl: './settle-user-account.component.html',
    styleUrls: ['./settle-user-account.component.scss'],
})
export class SettleUserAccountComponent implements OnInit, OnDestroy {

    @Input() userAccountId: string;

    userAccount?: UserAccount;
    house$: Observable<House>;
    house?: House;
    receiverAccountId: string;
    accounts?: UserAccount[];

    private houseSub: Subscription;

    constructor(private modalController: ModalController,
                private houseService: HouseService,
                private settlementService: SettlementService,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$.subscribe((house => {
            this.house = house;
            this.userAccount = house?.getUserAccountById(this.userAccountId);
            this.accounts = this.house?.accounts.filter(acc => acc.id !== this.userAccountId);
        }));
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    dismiss() {
        this.modalController.dismiss();
    }

    updateReceiver($event) {
        this.receiverAccountId = $event?.detail?.value || undefined;
    }

    async settleAccount() {
        const alert = await this.alertController.create({
            header: this.translate.instant('house.overview.settle.userAccount.header'),
            message: this.translate.instant('house.overview.settle.userAccount.message'),
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel'
                }, {
                    text: this.translate.instant('actions.yes'),
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: this.translate.instant('actions.settling'),
                            translucent: true,
                            backdropDismiss: false
                        });

                        await loading.present();

                        this.settlementService.settleUserAccount(this.house?.id, this.userAccount?.id, this.receiverAccountId)
                            .subscribe(() => {
                                loading.dismiss();
                                this.dismiss();
                            });
                    }
                }
            ]
        });

        await alert.present();
    }
}
