import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from 'firebase/app';
import {GroupService} from '../../services/group.service';
import {UserService} from '../../services/user.service';
import {Group} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {EventsService} from '../../services/events.service';
import {take} from 'rxjs/operators';
import {OnboardingComponent} from './onboarding/onboarding.component';
import {StorageService} from '../../services/storage.service';
import {UIService} from '../../services/ui.service';
import {LoggerService} from '../../services/logger.service';
import User = firebase.User;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
    private readonly logger = LoggerService.getLogger(DashboardPage.name);

    user$: Observable<User>;
    groups$: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

    private user: User;
    private loadingGroupJoin?: HTMLIonLoadingElement;
    private unsubscribeFn;
    private showingOnboarding: boolean;

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
                private uiService: UIService) {
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

    private launchOnBoarding() {
        this.modalController.create({
            // swipeToClose: false,
            // backdropDismiss: false,
            component: OnboardingComponent
        }).then((modal) => {
            this.zone.run(() => {
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
}
