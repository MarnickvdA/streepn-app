import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, UserAccount} from '../../../models';
import {GroupService} from '../../../services/group.service';
import {getMoneyString} from '../../../utils/firestore-utils';
import {PushService, PushTopic} from '../../../services/push.service';
import {Subscription} from 'rxjs';
import {StorageService} from '../../../services/storage.service';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.page.html',
    styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit, OnDestroy {

    groupId: string;
    account: UserAccount;
    enablePush: boolean;
    private group: Group;
    private groupSub: Subscription;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private pushService: PushService,
                private storage: StorageService) {

        this.account = this.router.getCurrentNavigation().extras.state?.account;

        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;

            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;
                });
        });

        this.storage.get(`${this.account.id}_enablePush`)
            .then((enabled: boolean) => {
                this.enablePush = enabled;
            })
            .catch(() => {
                this.enablePush = false;
            });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    getBalance(money: number) {
        return `€ ${getMoneyString(money)}`;
    }

    togglePush() {
        if (this.enablePush) {
            this.storage.set(`${this.account.id}_enablePush`, false);
            this.pushService.subscribeTopic(PushTopic.GROUP_ALL, this.groupId);
        } else {
            this.storage.set(`${this.account.id}_enablePush`, true);
            this.pushService.unsubscribeTopic(PushTopic.GROUP_ALL, this.groupId);
        }
    }
}
