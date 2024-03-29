import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {House, UserAccount, UserRole} from '@core/models';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {
    AccountService,
    AuthService,
    EventsService,
    HouseService,
    LoggerService,
    PushService,
    PushTopic,
    StorageService
} from '@core/services';
import {SettleUserAccountComponent} from '@modules/house/overview/settlements/settle-user-account/settle-user-account.component';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.page.html',
    styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit, OnDestroy {
    houseId: string;
    account?: UserAccount;
    isSelf: boolean;
    enablePush: boolean;
    enableAdmin: boolean;
    canDisableAdmin: boolean;
    house: House;
    newName: string;
    isAdmin: boolean;
    statisticItems: {
        productName: string;
        totalIn: number;
        totalOut: number;
        amountIn: number;
        amountOut: number;
    }[] = [];
    private readonly logger = LoggerService.getLogger(AccountDetailPage.name);
    private routeSub: Subscription;
    private houseSub: Subscription;
    private accountId: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private alertController: AlertController,
                private modalController: ModalController,
                private translate: TranslateService,
                private events: EventsService,
                private navController: NavController) {

        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.accountId = params.accountId;
        });
    }

    ngOnInit() {
        this.houseId = this.houseService.currentHouseId;
        this.houseSub = this.houseService.observeHouse(this.houseId)
            .subscribe(house => {
                this.house = house;

                if (house) {
                    this.isAdmin = this.house.getUserAccountByUserId(this.authService.currentUser?.uid)?.isAdmin;
                    this.account = this.house.getUserAccountById(this.accountId);

                    if (this.account) {
                        this.newName = this.account.name;
                        this.isSelf = this.authService.currentUser.uid === this.account.userId;
                        this.canDisableAdmin = this.house.accounts.filter(acc => acc.isAdmin)?.length > 1 || !this.isSelf;
                        this.enableAdmin = this.account.isAdmin;
                        this.storage.get(`${this.account.id}_enablePush`)
                            .then((enabled: boolean) => {
                                this.enablePush = enabled;
                            })
                            .catch(() => {
                                this.enablePush = false;
                            });

                        this.generateStatistics(house, this.account);
                    }
                }
            });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.houseSub.unsubscribe();
    }

    togglePush() {
        if (this.enablePush) {
            this.pushService.unsubscribeTopic(PushTopic.houseAll, {houseId: this.houseId, accountId: this.account.id});
        } else {
            this.pushService.subscribeTopic(PushTopic.houseAll, {houseId: this.houseId, accountId: this.account.id});
        }
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

        this.accountService.updateUserAccount(this.house, account)
            .catch(err => {
                this.logger.error({message: err});
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    async promptDeleteAccountDialog() {
        const alert = await this.alertController.create({
            header: this.translate.instant('house.overview.account.deletePrompt.header'),
            message: this.translate.instant(`house.overview.account.deletePrompt.message-${this.isSelf ? 'self' : 'other'}`,
                {name: this.isSelf ? this.house.name : this.account.name}),
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel'
                }, {
                    text: this.translate.instant('actions.yes'),
                    handler: async () => this.deleteAccount()
                }
            ]
        });

        await alert.present();
    }

    private async deleteAccount() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.deleting'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.events.subscribe('house:left', (success) => {
            loading.dismiss();

            if (success) {
                if (this.isSelf) {
                    this.navController.navigateRoot('dashboard', {animationDirection: 'back'});
                } else {
                    this.navController.navigateBack(`house/${this.house.id}/preferences`);
                }
            }

            this.events.unsubscribe('house:left');
        });

        this.houseService.leaveHouse(this.house.id, this.account.userId);
    }

    async toggleAdmin() {
        if (this.enableAdmin) {
            const alert = await this.alertController.create({
                header: this.translate.instant('house.overview.account.disableAdmin.header'),
                message: this.translate.instant('house.overview.account.disableAdmin.message', {
                    name: this.isSelf ? this.translate.instant('house.overview.account.disableAdmin.you') : this.account.name
                }),
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        handler: () => {
                            this.enableAdmin = !this.enableAdmin;
                        }
                    }, {
                        text: this.translate.instant('actions.yes'),
                        handler: async () => {
                            const loading = await this.loadingController.create({
                                message: this.translate.instant('actions.updating'),
                                translucent: true,
                                backdropDismiss: false
                            });

                            await loading.present();
                            const account: UserAccount = this.account.deepCopy();

                            account.roles = account.roles.filter(item => item !== UserRole.admin);

                            this.accountService.updateUserAccount(this.house, account)
                                .finally(() => {
                                    loading.dismiss();
                                });
                        }
                    }
                ]
            });

            await alert.present();
        } else {
            const loading = await this.loadingController.create({
                message: this.translate.instant('actions.updating'),
                translucent: true,
                backdropDismiss: false
            });

            await loading.present();
            const account: UserAccount = this.account.deepCopy();

            account.roles.push(UserRole.admin);

            this.accountService.updateUserAccount(this.house, account)
                .finally(() => {
                    loading.dismiss();
                });
        }
    }

    settleUser() {
        this.modalController.create({
            component: SettleUserAccountComponent,
            componentProps: {
                userAccountId: this.account.id
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    private generateStatistics(house: House, account: UserAccount) {
        const items = [];
        house.products.forEach((product) => {
            const productItem = account.balance.products[product.id];

            items.push({
                productName: product.name,
                totalIn: productItem?.totalIn ?? 0,
                totalOut: productItem?.totalOut ?? 0,
                amountIn: productItem?.amountIn ?? 0,
                amountOut: productItem?.amountOut ?? 0,
            });
        });

        this.statisticItems = items;
    }
}
