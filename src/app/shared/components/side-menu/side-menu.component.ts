import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {AuthService, GroupService} from '@core/services';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {

    @Input() contentId: string;
    private userSub: Subscription;
    groups$: Observable<Group[]>;

    constructor(private authService: AuthService,
                private groupService: GroupService) {
    }

    ngOnInit() {
        this.userSub = this.authService.user
            .subscribe((user) => {
                if (user) {
                    this.groups$ = this.groupService.observeGroups(user.uid);
                }
            });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}
