import {Component, OnDestroy, OnInit} from '@angular/core';
import {EMPTY, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, Transaction} from '@core/models';
import {newTransaction, TransactionItem} from '@core/models/transaction';
import {catchError} from 'rxjs/operators';
import {EventsService, GroupService, LoggerService, TransactionService} from '@core/services';
import {LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {getMoneyString} from '@core/utils/formatting-utils';

@Component({
    selector: 'app-transaction-detail',
    templateUrl: './transaction-detail.page.html',
    styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(TransactionDetailPage.name);
    editing: boolean;
    canEdit = false;
    transactionId?: string;
    group?: Group;
    transaction?: Transaction;
    itemsAmount: number[] = [];
    interactionCount = 0;
    private groupSub: Subscription;
    private transactionSub: Subscription;
    private routeSub: Subscription;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private navController: NavController,
                private groupService: GroupService,
                private events: EventsService) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.transactionId = params.transactionId;
        });
    }

    ngOnInit() {
        this.groupSub = this.groupService.observeGroup(this.groupService.currentGroupId)
            .subscribe((group) => {
                this.group = group;
            });

        this.transactionSub = this.transactionService.observeTransaction(this.groupService.currentGroupId, this.transactionId)
            .subscribe((transaction) => {
                // TODO Show error if transaction was edited by someone else while editing.
                if (transaction) {
                    this.setTransaction(transaction);
                }
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
        this.transactionSub.unsubscribe();
        this.routeSub.unsubscribe();
    }

    setTransaction(transaction: Transaction) {
        transaction?.items.forEach((item, index) => {
            this.itemsAmount.push(item.amount);
        });

        this.transaction = newTransaction(transaction.id, transaction);

        for (const item of this.transaction.items) {
            if (!this.canEdit) {
                const canEditItem = this.canEditItem(item);
                if (canEditItem) {
                    this.canEdit = true;
                    break;
                }
            }
        }
    }

    getPriceString(price: number): string {
        return getMoneyString(price);
    }

    toggleEditing() {
        this.editing = !this.editing;
    }

    async deleteTransaction() {
        const delTransaction = newTransaction(this.transaction.id, this.transaction.deepCopy());
        delTransaction.items.map(item => {
            if (this.canEditItem(item)) {
                item.amount = 0;
            }
            return item;
        });

        this.interactionCount = 1;

        await this.submitForm(delTransaction);
    }

    async editTransaction() {
        if (this.interactionCount === 0) {
            return this.toggleEditing();
        }

        await this.submitForm(this.transaction);
    }

    private async submitForm(transaction: Transaction) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.transactionService.editTransaction(this.groupService.currentGroupId, transaction)
            .pipe(
                catchError((err) => {
                    loading.dismiss();
                    this.logger.error({message: err});
                    return EMPTY;
                })
            )
            .subscribe(() => {
                loading.dismiss();
                this.navController.pop();
                this.events.publish('transactions:update');
            });
    }

    removeItem(item: TransactionItem) {
        item.amount--;
        this.interactionCount++;
    }

    addItem(item: TransactionItem) {
        item.amount++;
        this.interactionCount--;
    }

    canEditItem(item: TransactionItem) {
        // If this account was settled after this transaction was created, we cannot edit this transaction item.
        const settleTimestamp = this.group?.getAccountById(item.accountId)?.settledAt;
        if (settleTimestamp) {
            return this.transaction.createdAt > settleTimestamp;
        } else {
            return true;
        }
    }
}
