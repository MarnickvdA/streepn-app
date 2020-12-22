import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from 'firebase/app';
import {GroupService} from '../../services/group.service';
import {UserService} from '../../services/user.service';
import {Group} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {EventsService} from '../../services/events.service';
import {PushService} from '../../services/push.service';
import User = firebase.User;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {

    user$: Observable<User>;
    groups$: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

    private unsubscribe;
    private user: User;
    private loadingGroupJoin?: HTMLIonLoadingElement;

    constructor(private authService: AuthService,
                private navController: NavController,
                private groupService: GroupService,
                private userService: UserService,
                private alertController: AlertController,
                private translate: TranslateService,
                private zone: NgZone,
                private eventsService: EventsService,
                private loadingController: LoadingController,
                private pushService: PushService) {
    }

    ngOnInit() {
        this.pushService.initialize();

        this.user$ = this.authService.user;

        this.user$.subscribe(user => {
            this.user = user;
            this.unsubscribe = this.groupService.observeGroups(user.uid)
                .onSnapshot(snapshot => {
                    const groups = [];

                    snapshot.docs.forEach((doc) => {
                        groups.push(doc.data());
                    });

                    this.groups$.next(groups);
                });
        });

        if (window.localStorage.getItem('groupInvite')) {
            this.promptGroupInvite(window.localStorage.getItem('groupInvite'));
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe();
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
                            // TODO Error message
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    private promptGroupInvite(groupInvite: string) {
        // Fuck this item, don't want it more than once.
        window.localStorage.removeItem('groupInvite');

        this.groupService.getGroupByInviteLink(groupInvite)
            .then(group => {
                this.zone.run(() => {
                    console.log(groupInvite);
                    console.log(group);

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
        console.log('Joining: ' + groupId);
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
}
