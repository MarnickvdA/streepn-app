import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import firebase from 'firebase/app';
import {Group, GroupInvite, UserAccount} from '@core/models';
import {AdsService, AuthService, EventsService, GroupService, LoggerService, StorageService, UIService, UserService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {catchError, take} from 'rxjs/operators';
import {OnboardingComponent} from '@modules/dashboard/onboarding/onboarding.component';
import {Capacitor} from '@capacitor/core';
import {NewGroupComponent} from '@modules/dashboard/new-group/new-group.component';
import User = firebase.User;
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faTicket} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
    user$: Observable<User>;
    private groups$: Observable<Group[]>;
    private groupsSub: Subscription;
    groups?: Group[];
    loading: boolean;
    private userSub: Subscription;
    private readonly logger = LoggerService.getLogger(DashboardPage.name);
    private user: User;
    private loadingGroupJoin?: HTMLIonLoadingElement;
    private onboarding: boolean;
    groupAccounts: { [groupId: string]: UserAccount } = {};
    iOS: boolean;

    constructor(private authService: AuthService,
                private navController: NavController,
                private groupService: GroupService,
                private userService: UserService,
                private alertController: AlertController,
                private translate: TranslateService,
                private zone: NgZone,
                private eventsService: EventsService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private storage: StorageService,
                private uiService: UIService,
                private ads: AdsService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faTicket);
        this.iOS = Capacitor.isNative && Capacitor.platform === 'ios';
        this.loading = true;
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.userSub = this.user$.subscribe(user => {
            this.user = user;
        });

        this.user$.pipe(take(1))
            .subscribe(user => {
                if (user) {
                    this.groups$ = this.groupService.observeGroups(user.uid);
                    this.groupsSub = this.groups$
                        .subscribe(groups => {
                            this.groups = groups;
                            this.groupAccounts = {};

                            groups?.forEach(group => {
                                this.groupAccounts[group.id] = group.getUserAccountByUserId(user.uid);
                            });

                            this.loading = false;
                        });
                }
            });

        this.eventsService.subscribe('app:resume', () => {
            this.checkForGroupInvite();
        });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
        this.groupsSub?.unsubscribe();
        this.eventsService.unsubscribe('app:resume', () => {
            this.checkForGroupInvite();
        });
    }

    ngAfterViewInit() {
        this.storage.get('hasOnboarded')
            .then((hasOnboarded: boolean) => {
                if (hasOnboarded) {
                    this.checkForGroupInvite();
                } else {
                    this.launchOnBoarding();
                }
            })
            .catch(() => {
                this.launchOnBoarding();
            });
    }

    ionViewDidEnter() {
        if (!this.onboarding) {
            this.ads.showBanner();
        }
    }

    ionViewWillLeave() {
        this.ads.hideBanner();
    }

    async promptManualGroupJoin() {
        const alert = await this.alertController.create({
            header: this.translate.instant('dashboard.groupInvite.manualHeader'),
            inputs: [
                {
                    name: 'groupCode',
                    type: 'text',
                    placeholder: this.translate.instant('dashboard.groupInvite.code')
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                }, {
                    text: this.translate.instant('actions.submit'),
                    handler: (result: { groupCode: string }) => {
                        if (result.groupCode.length === 8) {
                            this.promptGroupInvite(result.groupCode);
                        } else {
                            this.uiService.showError(
                                this.translate.instant('errors.error'),
                                this.translate.instant('dashboard.groupInvite.invalidCode')
                            );
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    private launchOnBoarding() {
        this.onboarding = true;
        this.ads.hideBanner();
        this.modalController.create({
            // swipeToClose: false,
            // backdropDismiss: false,
            component: OnboardingComponent
        }).then((modal) => {
            this.zone.run(() => {
                modal.onDidDismiss()
                    .then(() => {
                        this.onboarding = false;
                        this.ads.showBanner();
                    });
                modal.present();
            });
        });
    }

    private checkForGroupInvite() {
        this.storage.get('groupInvite')
            .then((invite: string) => {
                return this.storage.get('hasOnboarded')
                    .then((hasOnboarded: boolean) => {
                        if (hasOnboarded) {
                            this.promptGroupInvite(invite);
                        }
                    });
            })
            .catch(() => {
            });
    }

    private promptGroupInvite(groupInvite: string) {
        // Fuck this item, don't want it more than once.
        this.storage.delete('groupInvite');

        this.groupService.getGroupByInviteLink(groupInvite)
            .then(invite => {
                this.zone.run(() => {
                    this.alertController.create({
                        header: this.translate.instant('dashboard.groupInvite.header'),
                        message: this.translate.instant('dashboard.groupInvite.question') + '<b>' + invite.groupName + '</b>?',
                        buttons: [
                            {
                                text: this.translate.instant('actions.deny'),
                                role: 'cancel'
                            }, {
                                text: this.translate.instant('actions.accept'),
                                handler: () => {
                                    this.joinGroup(invite);
                                }
                            }
                        ]
                    }).then(alert => {
                        return alert.present();
                    });
                });
            })
            .catch((err) => {
                this.logger.error({
                    message: err
                });
                this.uiService.showError(this.translate.instant('errors.error'), err);
            });
    }

    private joinGroup(groupInvite: GroupInvite) {
        this.showLoading();

        this.eventsService.subscribe('group:joined', () => {
            this.loadingGroupJoin?.dismiss();

            this.eventsService.unsubscribe('group:joined');
        });

        this.groupService.joinGroup(groupInvite, this.user);
    }

    private async showLoading() {
        this.loadingGroupJoin = await this.loadingController.create({
            message: this.translate.instant('actions.joining'),
            translucent: true,
            backdropDismiss: false
        });

        await this.loadingGroupJoin.present();

        this.loadingGroupJoin.onDidDismiss()
            .then(() => {
                this.loadingGroupJoin = undefined;
            });
    }

    openGroup(group: Group) {
        this.navController.navigateRoot(['group', group.id, 'home'], {
            animationDirection: 'forward',
        });
    }

    addGroup() {
        this.modalController.create({
            swipeToClose: true,
            backdropDismiss: true,
            component: NewGroupComponent
        }).then((modal) => {
            this.zone.run(() => {
                modal.present();
            });
        });
    }
}
