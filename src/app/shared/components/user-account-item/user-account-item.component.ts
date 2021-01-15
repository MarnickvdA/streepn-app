import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Group, UserAccount} from '@core/models';
import {TranslateService} from '@ngx-translate/core';
import {NavController} from '@ionic/angular';
import {AuthService, GroupService} from '@core/services';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit, OnDestroy {

    ownsAccount: boolean;
    @Input() account: UserAccount;
    @Input() canEditAccount = false;
    @Input() navLink?: string;

    group?: Group;
    private groupSub: Subscription;

    constructor(private translate: TranslateService,
                private groupService: GroupService,
                private authService: AuthService,
                private navController: NavController) {
    }

    ngOnInit() {
        this.groupSub = this.groupService.observeGroup(this.groupService.currentGroupId)
            .subscribe((group) => {
                this.group = group;
            });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    openAccount() {
        if (this.canEditAccount) {
            this.navController.navigateForward(this.navLink, {
                state: {
                    account: this.account
                }
            });
        }
    }
}
