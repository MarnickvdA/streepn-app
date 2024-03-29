import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {AccountSettlement, House, SharedAccount} from '@core/models';
import {HouseService} from '@core/services';
import {calculatePayout} from '@core/utils/streepn-logic';
import {TranslateService} from '@ngx-translate/core';
import {getMoneyString} from '@core/utils/formatting-utils';
import {SettlementService} from '@core/services/api/settlement.service';
import {catchError} from 'rxjs/operators';
import {AlertService} from '@core/services/alert.service';

@Component({
    selector: 'app-settle-shared-account',
    templateUrl: './settle-shared-account.component.html',
    styleUrls: ['./settle-shared-account.component.scss'],
})
export class SettleSharedAccountComponent implements OnInit, OnDestroy {

    @Input() sharedAccountId: string;

    sharedAccount?: SharedAccount;
    house$: Observable<House>;
    house?: House;
    payers: {
        [id: string]: boolean;
    } = {};
    payerAmount: {
        [id: string]: number;
    } = {};

    private houseSub: Subscription;
    private settlement: AccountSettlement;

    constructor(private modalController: ModalController,
                private houseService: HouseService,
                private settlementService: SettlementService,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private alertService: AlertService,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$.subscribe((house => {
            this.house = house;
            this.sharedAccount = house?.getSharedAccountById(this.sharedAccountId);

            if (house) {
                this.reset();
            }
        }));
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    dismiss() {
        this.modalController.dismiss();
    }

    reset() {
        this.zone.run(_ => {
            this.house?.accounts.forEach((acc) => {
                this.payers[acc.id] = false;
            });
        });
    }

    selectAll() {
        this.house?.accounts.forEach((acc, i) => {
            this.payers[acc.id] = true;
        });

        this.updateSettle();
    }

    canSettle(): boolean {
        return Object.values(this.payers).includes(true);
    }

    getMoneyAmount(money: number): string {
        return getMoneyString(money);
    }

    async settleAccount() {
        const alert = await this.alertController.create({
            header: this.translate.instant('house.overview.settle.sharedAccount.header'),
            message: this.translate.instant('house.overview.settle.sharedAccount.message'),
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

                        this.settlementService.settleSharedAccount(this.house?.id, this.sharedAccount?.id, this.settlement)
                            .pipe(
                                catchError(err => {
                                    this.alertService.promptApiError(err.message);
                                    loading.dismiss();
                                    return EMPTY;
                                })
                            )
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

    updateSettle() {
        const payerKeys: string[] = Object.keys(this.payers).filter(k => this.payers[k]);

        this.settlement = {};
        calculatePayout(this.sharedAccount?.balance, payerKeys.length).forEach((p, i) => {
            this.settlement[payerKeys[i]] = p;
        });

        const newPayerAmount = {};
        payerKeys.forEach((k) => {
            newPayerAmount[k] = this.settlement[k]?.totalOut || 0;
        });

        this.payerAmount = newPayerAmount;
    }
}
