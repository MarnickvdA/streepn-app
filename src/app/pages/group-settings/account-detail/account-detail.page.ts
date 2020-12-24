import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable} from 'rxjs';
import {UserAccount} from '../../../models';
import {GroupService} from '../../../services/group.service';
import {map} from 'rxjs/operators';
import {getMoneyString} from '../../../utils/firestore-utils';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.page.html',
    styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit {

    groupId: string;
    accountId: string;
    account$: Observable<UserAccount>;

    constructor(private route: ActivatedRoute,
                private groupService: GroupService) {
        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
            this.accountId = params.accountId;

            this.account$ = this.groupService.observeGroup(params.id)
                .pipe(
                    map((group) => {
                        return group.accounts.find(account => account.id === this.accountId);
                    })
                );
        });
    }

    ngOnInit() {
    }

    getBalance(money: number) {
        return `€ ${getMoneyString(money)}`;
    }

}
