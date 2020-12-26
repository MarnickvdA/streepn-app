import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, UserAccount} from '../../../models';
import {GroupService} from '../../../services/group.service';
import {getMoneyString} from '../../../utils/firestore-utils';
import {PushService, PushTopic} from '../../../services/push.service';
import {Subscription} from 'rxjs';
import {StorageService} from '../../../services/storage.service';
import {AccountService} from '../../../services/account.service';
import {LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {LoggerService} from '../../../services/logger.service';

@Component({
    selector: 'app-account-detail',
    templateUrl: './account-detail.page.html',
    styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(AccountDetailPage.name);

    groupId: string;
    account: UserAccount;
    enablePush: boolean;
    private group: Group;
    private groupSub: Subscription;
    newName: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private pushService: PushService,
                private storage: StorageService,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private translate: TranslateService) {

        this.account = this.router.getCurrentNavigation().extras.state?.account;
        this.newName = this.account.name;

        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;

            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;
                });
        });
    }

    ngOnInit() {
        this.storage.get(`${this.account.id}_enablePush`)
            .then((enabled: boolean) => {
                this.enablePush = enabled;
            })
            .catch(() => {
                this.enablePush = false;
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    getBalance(money: number) {
        return `€ ${getMoneyString(money)}`;
    }

    togglePush() {
        if (this.enablePush) {
            this.pushService.subscribeTopic(PushTopic.GROUP_ALL, {groupId: this.groupId, accountId: this.account.id});
        } else {
            this.pushService.unsubscribeTopic(PushTopic.GROUP_ALL, {groupId: this.groupId, accountId: this.account.id});
        }
    }

    async setName() {
        const account = Object.create(this.account);
        account.name = this.newName;

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.saving'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.accountService.updateUserAccount(this.group, account)
            .then(() => {
                this.account = account;
            })
            .catch(err => {
                this.logger.error({message: err});
            })
            .finally(() => {
                loading.dismiss();
            });
    }
}
