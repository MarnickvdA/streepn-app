import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AlertController, NavController} from '@ionic/angular';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from 'firebase/app';
import {GroupService} from '../../services/group.service';
import {UserService} from '../../services/user.service';
import {Group} from '../../models';
import {TranslateService} from '@ngx-translate/core';
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

    constructor(private authService: AuthService,
                private navController: NavController,
                private groupService: GroupService,
                private userService: UserService,
                private alertController: AlertController,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.user$.subscribe(user => {
            this.unsubscribe = this.groupService.observeGroups(user.uid)
                .onSnapshot(snapshot => {
                    const groups = [];

                    snapshot.docs.forEach((doc) => {
                        groups.push(doc.data());
                    });

                    this.groups$.next(groups);
                });
        });
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
}
