import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, UserAccount} from '@core/models';
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
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faBell, faMinusCircle, faPlusCircle, faUser, faUsersCrown, faWallet} from '@fortawesome/pro-duotone-svg-icons';

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
    private routeSub: Subscription;
    private groupSub: Subscription;
    private accountId: string;

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
                private navController: NavController,
                private iconLibary: FaIconLibrary) {
        this.iconLibary.addIcons(faUser, faBell, faUsersCrown, faWallet, faPlusCircle, faMinusCircle);

        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.accountId = params.accountId;
        });
    }

    ngOnInit() {
        this.groupId = this.groupService.currentGroupId;
        this.groupSub = this.groupService.observeGroup(this.groupId)
            .subscribe(group => {
                this.group = group;

                if (group) {
                    this.isAdmin = this.group.accounts
                        .find(acc => acc.userId === this.authService.currentUser?.uid)?.roles.includes('ADMIN');
                    this.account = this.group.accounts.find(acc => acc.id === this.accountId);
                    this.newName = this.account.name;
                    this.isSelf = this.authService.currentUser.uid === this.account.userId;
                    this.canDisableAdmin = this.group.accounts.filter(acc => acc.roles.includes('ADMIN'))?.length > 1 || !this.isSelf;
                    this.enableAdmin = this.account.roles.includes('ADMIN');
                    this.storage.get(`${this.account.id}_enablePush`)
                        .then((enabled: boolean) => {
                            this.enablePush = enabled;
                        })
                        .catch(() => {
                            this.enablePush = false;
                        });

                }
            });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.groupSub.unsubscribe();
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
