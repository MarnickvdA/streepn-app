import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, UserAccount} from '@core/models';
import {getMoneyString} from '@core/utils/firestore-utils';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {
    AccountService,
    AuthService,
    EventsService,
    GroupService,
    LoggerService,
    PushService,
    PushTopic,
    StorageService
} from '@core/services';
import {take} from 'rxjs/operators';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.page.html',
    styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit, OnDestroy {
    groupId: string;
    account: UserAccount;
    isSelf: boolean;
    enablePush: boolean;
    enableAdmin: boolean;
    canDisableAdmin: boolean;
    group: Group;
    newName: string;
    isAdmin: boolean;
    private readonly logger = LoggerService.getLogger(AccountDetailPage.name);
    private groupSub: Subscription;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private alertController: AlertController,
                private translate: TranslateService,
                private events: EventsService,
                private navController: NavController) {

        this.account = this.router.getCurrentNavigation().extras.state?.account;
        this.newName = this.account.name;

        this.route.params.pipe(take(1)).subscribe((params: Params) => {
            this.groupId = params.id;

            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;

                    if (group) {
                        this.isAdmin = this.group.accounts
                            .find(acc => acc.userId === authService.currentUser?.uid)?.roles.includes('ADMIN');
                        this.account = this.group.accounts.find(acc => acc.id === this.account.id);
                        this.canDisableAdmin = this.group.accounts.filter(acc => acc.roles.includes('ADMIN'))?.length > 1 || !this.isSelf;
                        this.enableAdmin = this.account.roles.includes('ADMIN');
                    }
                });
        });
    }

    ngOnInit() {
        this.storage.get(`${this.account.id}_enablePush`)
            .then((enabled: boolean) => {
                this.enablePush = enabled;
            })
            .catch(() => {
                this.enablePush = false;
            });

        this.isSelf = this.authService.currentUser.uid === this.account.userId;
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    getBalance(money: number) {
        return `€ ${getMoneyString(money)}`;
    }

    togglePush() {
        if (this.enablePush) {
            this.pushService.unsubscribeTopic(PushTopic.GROUP_ALL, {groupId: this.groupId, accountId: this.account.id});
        } else {
            this.pushService.subscribeTopic(PushTopic.GROUP_ALL, {groupId: this.groupId, accountId: this.account.id});
        }
    }

    async setName() {
        const account = Object.create(this.account);
        account.name = this.newName;

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.saving'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.accountService.updateUserAccount(this.group, account)
            .then(() => {
                this.account = account;
            })
            .catch(err => {
                this.logger.error({message: err});
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    async deleteAccount() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.deleting'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.events.subscribe('group:left', (success) => {
            loading.dismiss();

            if (success) {
                this.navController.navigateRoot('dashboard', {animationDirection: 'back'});
            }

            this.events.unsubscribe('group:left');
        });

        this.groupService.leaveGroup(this.group.id, this.account.userId);
    }

    async toggleAdmin() {
        if (this.enableAdmin) {
            const alert = await this.alertController.create({
                header: this.translate.instant('group.overview.account.disableAdmin.header'),
                message: this.translate.instant('group.overview.account.disableAdmin.message', {
                    name: this.isSelf ? this.translate.instant('group.overview.account.disableAdmin.you') : this.account.name
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
                            const account: UserAccount = Object.create(this.account);

                            account.roles = account.roles.filter(item => item !== 'ADMIN');

                            this.accountService.updateUserAccount(this.group, account)
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
            const account: UserAccount = Object.create(this.account);

            account.roles.push('ADMIN');

            this.accountService.updateUserAccount(this.group, account)
                .finally(() => {
                    loading.dismiss();
                });
        }
    }
}
