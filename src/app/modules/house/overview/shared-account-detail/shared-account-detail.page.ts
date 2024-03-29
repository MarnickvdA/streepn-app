import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {House, SharedAccount} from '@core/models';
import {AccountService, HouseService, LoggerService} from '@core/services';
import {LoadingController, ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {SettleSharedAccountComponent} from '@modules/house/overview/settlements/settle-shared-account/settle-shared-account.component';

@Component({
    selector: 'app-shared-account-detail',
    templateUrl: './shared-account-detail.page.html',
    styleUrls: ['./shared-account-detail.page.scss'],
})
export class SharedAccountDetailPage implements OnInit, OnDestroy {
    newName: string;
    house: House;
    account?: SharedAccount;
    private readonly logger = LoggerService.getLogger(SharedAccountDetailPage.name);
    private house$: Observable<House>;
    private routeSub: Subscription;
    private houseSub: Subscription;
    private accountId: string;

    constructor(private formBuilder: FormBuilder,
                private houseService: HouseService,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private translate: TranslateService,
                private navController: NavController,
                private route: ActivatedRoute) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.accountId = params.accountId;
        });
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$.subscribe((house => {
            if (house) {
                this.house = house;
                this.account = house.sharedAccounts.find(acc => acc.id === this.accountId);
                this.newName = this.account?.name;
            }
        }));
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
        this.houseSub.unsubscribe();
    }

    async setName() {
        const account = this.account.deepCopy();
        account.name = this.newName;

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.saving'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.accountService.updateSharedAccount(this.house, account)
            .catch(err => {
                this.logger.error({message: err});
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    settleSharedAccount(sharedAccountId: string) {
        this.modalController.create({
            component: SettleSharedAccountComponent,
            componentProps: {
                sharedAccountId
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    async removeSharedAccount() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.deleting'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.accountService.removeSharedAccount(this.house, this.account)
            .pipe(
                catchError((err) => {
                    loading.dismiss();
                    this.logger.error({message: err});
                    return EMPTY;
                })
            )
            .subscribe(() => {
                loading.dismiss();
                this.navController.pop();
            });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
