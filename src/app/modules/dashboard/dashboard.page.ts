import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from 'firebase/app';
import {GroupService} from '../../core/services/group.service';
import {UserService} from '../../core/services/user.service';
import {Group} from '../../core/models';
import {TranslateService} from '@ngx-translate/core';
import {EventsService} from '../../core/services/events.service';
import {take} from 'rxjs/operators';
import {OnboardingComponent} from './onboarding/onboarding.component';
import {StorageService} from '../../core/services/storage.service';
import {UIService} from '../../core/services/ui.service';
import {LoggerService} from '../../core/services/logger.service';
import {AdsService} from '../../core/services/ads.service';
import User = firebase.User;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
    user$: Observable<User>;
    groups$: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);
    private readonly logger = LoggerService.getLogger(DashboardPage.name);
    private user: User;
    private loadingGroupJoin?: HTMLIonLoadingElement;
    private onboarding: boolean;
    private unsubscribeFn;

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
                private ads: AdsService) {
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.user$.subscribe(user => {
            this.user = user;
        });

        this.user$.pipe(take(1))
            .subscribe(user => {
                if (user) {
                    this.unsubscribeFn = this.groupService.observeGroups(user.uid)
                        .onSnapshot(snapshot => {
                            let groups = [];

                            snapshot.docs.forEach((doc) => {
                                groups.push(doc.data());
                            });

                            groups = groups.sort((g1: Group, g2: Group) => {
                                const d1 = g1.createdAt.toDate().getTime();
                                const d2 = g2.createdAt.toDate().getTime();

                                if (d1 === d2) {
                                    return 0;
                                }
                                if (d1 > d2) {
                                    return 1;
                                }
                                if (d1 < d2) {
                                    return -1;
                                }
                            });

                            this.groups$.next(groups);
                        });
                }
            });

        this.eventsService.subscribe('app:resume', () => {
            this.checkForGroupInvite();
        });
    }

    ngOnDestroy() {
        this.unsubscribeFn();
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
            .then(group => {
                this.zone.run(() => {
                    if (!group.members.find(uid => uid === this.user.uid)) {
                        this.alertController.create({
                            header: this.translate.instant('dashboard.groupInvite.header'),
                            message: this.translate.instant('dashboard.groupInvite.question') + '<b>' + group.name + '</b>?',
                            buttons: [
                                {
                                    text: this.translate.instant('actions.deny'),
                                    role: 'cancel'
                                }, {
                                    text: this.translate.instant('actions.accept'),
                                    handler: () => {
                                        this.joinGroup(group.id);
                                    }
                                }
                            ]
                        }).then(alert => {
                            return alert.present();
                        });
                    }
                });
            })
            .catch((err) => {
                this.logger.error({
                    message: err
                });
                this.uiService.showError(this.translate.instant('errors.error'), err);
            });
    }

    private joinGroup(groupId: string) {
        this.showLoading();

        this.eventsService.subscribe('group:joined', () => {
            this.loadingGroupJoin?.dismiss();

            this.eventsService.unsubscribe('group:joined');
        });

        this.groupService.joinGroup(groupId, this.user);
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
}
