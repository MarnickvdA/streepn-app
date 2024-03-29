import {Component, OnDestroy, OnInit} from '@angular/core';
import {EMPTY, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {House, Transaction} from '@core/models';
import {newTransaction, TransactionItem} from '@core/models/transaction';
import {catchError} from 'rxjs/operators';
import {EventsService, HouseService, LoggerService, TransactionService} from '@core/services';
import {LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {getMoneyString} from '@core/utils/formatting-utils';
import {AlertService} from '@core/services/alert.service';

@Component({
    selector: 'app-transaction-detail',
    templateUrl: './transaction-detail.page.html',
    styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit, OnDestroy {
    editing = false;
    canEdit = false;
    canDelete = false;
    transactionId?: string;
    house?: House;
    transaction?: Transaction;
    itemsAmount: number[] = [];
    interactionCount = 0;

    private readonly logger = LoggerService.getLogger(TransactionDetailPage.name);
    private houseSub: Subscription;
    private transactionSub: Subscription;
    private routeSub: Subscription;
    private transactionObject?: Transaction;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private navController: NavController,
                private houseService: HouseService,
                private alertService: AlertService,
                private events: EventsService) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.transactionId = params.transactionId;
        });
    }

    ngOnInit() {
        this.houseSub = this.houseService.observeHouse(this.houseService.currentHouseId)
            .subscribe((house) => {
                this.house = house;
                this.toggleEditing(false);
            });

        this.transactionSub = this.transactionService.observeTransaction(this.houseService.currentHouseId, this.transactionId)
            .subscribe((transaction) => {
                // TODO Show error if transaction was edited by someone else while editing.
                if (transaction && transaction.id === this.transactionId) {
                    this.setTransaction(transaction);
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.transactionSub.unsubscribe();
        this.routeSub.unsubscribe();
    }

    setTransaction(transaction: Transaction) {
        this.itemsAmount = [];

        transaction?.items.forEach((item, index) => {
            this.itemsAmount.push(item.amount);
        });

        this.transactionObject = transaction;
        this.transaction = newTransaction(transaction.id, transaction);

        let canEditCount = 0;
        this.transaction.items?.forEach((item) => {
            if (this.canEditItem(item)) {
                canEditCount++;
            }
        });

        this.canEdit = canEditCount > 0;
        this.canDelete = this.transaction.items && canEditCount === this.transaction.items.length;
    }

    getPriceString(price: number): string {
        return getMoneyString(price);
    }

    toggleEditing(force?: boolean) {
        this.editing = force ?? !this.editing;

        if (!this.editing && this.transactionObject) {
            this.setTransaction(this.transactionObject);
        }
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

    removeItem(item: TransactionItem) {
        item.amount--;
        this.interactionCount++;
    }

    addItem(item: TransactionItem) {
        item.amount++;
        this.interactionCount--;
    }

    canEditItem(item: TransactionItem) {
        const acc = this.house?.getAccountById(item.accountId);
        if (!acc) {
            return false;
        }

        // If this account was settled after this transaction was created, we cannot edit this transaction item.
        const settleTimestamp = acc.settledAt;
        if (settleTimestamp) {
            return this.transaction.createdAt > settleTimestamp;
        } else {
            return true;
        }
    }

    private async submitForm(transaction: Transaction) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.transactionService.editTransaction(this.houseService.currentHouseId, transaction)
            .pipe(
                catchError((err) => {
                    this.alertService.promptApiError(err.message);
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
}
