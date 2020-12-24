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
import User = firebase.User;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {

    user$: Observable<User>;
    groups$: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

    private user: User;
    private loadingGroupJoin?: HTMLIonLoadingElement;
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
                private uiService: UIService) {
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.user$.subscribe(user => {
            this.user = user;
        });

        this.user$.pipe(take(1)).subscribe(user => {
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
        });

        this.eventsService.subscribe('app:resume', this.checkForGroupInvite);
    }

    ngOnDestroy() {
        this.unsubscribeFn();
        this.eventsService.unsubscribe('app:resume', this.checkForGroupInvite);
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

    async addGroup() {
        const alert = await this.alertController.create({
            header: this.translate.instant('dashboard.createGroup.header'),
            inputs: [
                {
                    name: 'groupName',
                    type: 'text',
                    placeholder: this.translate.instant('dashboard.createGroup.groupName')
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                }, {
                    text: this.translate.instant('actions.create'),
                    handler: (result: { groupName: string }) => {
                        if (result.groupName.length > 3) {
                            this.groupService.createGroup(result.groupName);
                        } else {
                            this.uiService.showError(
                                this.translate.instant('errors.error'),
                                this.translate.instant('dashboard.createGroup.invalidGroupName')
                            );
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    private checkForGroupInvite() {
        this.storage.get('groupInvite')
            .then((invite: string) => {
                this.promptGroupInvite(invite);
            })
            .catch(() => {
            });
    }

    private promptGroupInvite(groupInvite: string) {
        // Fuck this item, don't want it more than once.
        this.storage.delete('groupInvite');

        console.log('prompt for group: ' + groupInvite);

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
            });
    }

    private joinGroup(groupId: string) {
        this.showLoading();

        this.eventsService.subscribe('group:joined', () => {
            if (this.loadingGroupJoin) {
                this.loadingGroupJoin.dismiss();
            }

            this.eventsService.unsubscribe('group:joined');
        });

        this.groupService.joinGroup(groupId, this.user.displayName);
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
