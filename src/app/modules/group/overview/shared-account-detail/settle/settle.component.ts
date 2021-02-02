import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import {Group, SharedAccount, UserAccount} from '@core/models';
import {GroupService} from '@core/services';
import {AccountPayout, calculatePayout} from '@core/utils/streepn-logic';
import {TranslateService} from '@ngx-translate/core';
import {getMoneyString} from '@core/utils/formatting-utils';
import {SettlementService} from '@core/services/settlement.service';

@Component({
    selector: 'app-settle',
    templateUrl: './settle.component.html',
    styleUrls: ['./settle.component.scss'],
})
export class SettleComponent implements OnInit, OnDestroy {

    @Input() sharedAccountId: string;

    sharedAccount?: SharedAccount;
    group$: Observable<Group>;
    group?: Group;
    private groupSub: Subscription;
    payers: {
        [id: string]: boolean
    } = {};
    payerAmount: {
        [id: string]: number
    } = {};
    private settlement: {
        [id: string]: AccountPayout
    };

    constructor(private modalController: ModalController,
                private groupService: GroupService,
                private settlementService: SettlementService,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$.subscribe((group => {
            this.group = group;
            this.sharedAccount = group?.getSharedAccountById(this.sharedAccountId);
        }));
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    dismiss() {
        this.modalController.dismiss();
    }

    reset() {
        this.payers = {};
    }

    toggleAll() {
        this.group?.accounts.forEach((acc) => {
            this.payers[acc.id] = true;
        });

        this.updateSettle();
    }

    toggleAccount($event: any, account: UserAccount) {
        this.payers[account.id] = !this.payers[account.id];

        this.updateSettle();
    }

    private updateSettle() {
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

    canSettle(): boolean {
        return Object.values(this.payers).includes(true);
    }

    getMoneyAmount(money: number): string {
        return getMoneyString(money);
    }

    async settleAccount() {
        const alert = await this.alertController.create({
            header: this.translate.instant('group.overview.settle.sharedAccount.header'),
            message: this.translate.instant('group.overview.settle.sharedAccount.message'),
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

                        this.settlementService.settleSharedAccount(this.group?.id, this.sharedAccount?.id, this.settlement)
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
