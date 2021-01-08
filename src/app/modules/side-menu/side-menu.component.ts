import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import firebase from 'firebase';
import {Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {AuthService, GroupService} from '@core/services';
import User = firebase.User;

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {

    @Input() contentId: string;
    private user$: Observable<User>;
    private userSub: Subscription;
    groups$: Observable<Group[]>;
    user?: User;

    constructor(private authService: AuthService,
                private groupService: GroupService) {
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.userSub = this.user$
            .subscribe((user) => {
                this.user = user;
                if (user) {
                    this.groups$ = this.groupService.getGroupsObservable(user.uid);
                }
            });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}
