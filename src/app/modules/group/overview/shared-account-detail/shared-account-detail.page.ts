import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {Balance, Group, SharedAccount} from '@core/models';
import {AccountService, GroupService, LoggerService} from '@core/services';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faPiggyBank, faWallet} from '@fortawesome/pro-duotone-svg-icons';
import {SettleComponent} from '@modules/group/overview/shared-account-detail/settle/settle.component';

@Component({
    selector: 'app-shared-account-detail',
    templateUrl: './shared-account-detail.page.html',
    styleUrls: ['./shared-account-detail.page.scss'],
})
export class SharedAccountDetailPage implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(SharedAccountDetailPage.name);

    newName: string;
    group: Group;
    account?: SharedAccount;
    balance?: Balance;

    private group$: Observable<Group>;
    private routeSub: Subscription;
    private groupSub: Subscription;
    private accountId: string;

    constructor(private formBuilder: FormBuilder,
                private groupService: GroupService,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faPiggyBank, faWallet);
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.accountId = params.accountId;
        });
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$.subscribe((group => {
            if (group) {
                this.group = group;
                this.account = group.sharedAccounts.find(acc => acc.id === this.accountId);
                this.balance = group.getAccountBalance(this.account.id);
                this.newName = this.account.name;
            }
        }));
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
        this.groupSub.unsubscribe();
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

        this.accountService.updateSharedAccount(this.group, account)
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

    settleSharedAccount(sharedAccountId: string) {
        this.modalController.create({
            component: SettleComponent,
            componentProps: {
                sharedAccountId
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
