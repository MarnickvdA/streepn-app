import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Group, SharedAccount} from '@core/models';
import {NavController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '@core/services';

@Component({
    selector: 'app-shared-account-item',
    templateUrl: './shared-account-item.component.html',
    styleUrls: ['./shared-account-item.component.scss'],
})
export class SharedAccountItemComponent implements OnInit, OnDestroy {

    @Input() account: SharedAccount;
    @Input() canEditAccount = false;
    @Input() navLink?: string;

    group?: Group;
    private groupSub: Subscription;

    constructor(private translate: TranslateService,
                private groupService: GroupService,
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
