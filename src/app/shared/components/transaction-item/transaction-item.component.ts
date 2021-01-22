import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Group, Transaction, UserAccount} from '@core/models';
import {NavController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {AuthService, GroupService} from '@core/services';

@Component({
    selector: 'app-transaction-item',
    templateUrl: './transaction-item.component.html',
    styleUrls: ['./transaction-item.component.scss'],
})
export class TransactionItemComponent implements OnInit, OnDestroy {
    group?: Group;
    account?: UserAccount;
    currentAccount?: UserAccount;
    private groupSub: Subscription;
    private group$: Observable<Group>;
    @Input() transaction: Transaction;

    constructor(private navController: NavController,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private authService: AuthService) {
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe((group) => {
                this.group = group;

                this.currentAccount = group.getUserAccountByUserId(this.authService.currentUser.uid);
                this.account = group.getUserAccountById(this.transaction.createdBy);
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }


    openTransaction(transaction: Transaction) {
        if (transaction.removed) {
            return;
        }
        this.navController.navigateForward([transaction.id], {
            relativeTo: this.route,
            state: {
                group: this.group,
                transaction
            }
        });
    }

}
