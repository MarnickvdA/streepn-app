import {Component, OnInit} from '@angular/core';
import {EMPTY, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, Transaction} from '@core/models';
import {newTransaction, TransactionItem} from '@core/models/transaction';
import {getMoneyString} from '@core/utils/firestore-utils';
import {catchError} from 'rxjs/operators';
import {newGroup} from '@core/models/group';
import {EventsService, GroupService, TransactionService} from '@core/services';
import {LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-transaction-detail',
    templateUrl: './transaction-detail.page.html',
    styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit {

    editing: boolean;
    groupId: string;
    transactionId: string;
    group: Group;
    transaction: Transaction;
    itemsAmount: number[] = [];
    interactionCount = 0;
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
            this.groupId = this.groupService.currentGroupId;
            this.transactionId = params.transactionId;
        });
    }

    ngOnInit() {
        this.group = newGroup(this.groupId, this.router.getCurrentNavigation().extras.state?.group);
        this.setTransaction(newTransaction(this.transactionId, this.router.getCurrentNavigation().extras.state?.transaction));

        if (!this.transaction) {
            this.transactionService.getTransaction(this.groupId, this.transactionId)
                .then((transaction) => {
                    this.setTransaction(transaction);
                });
        }
    }

    setTransaction(transaction: Transaction) {
        transaction?.items.forEach((item, index) => {
            this.itemsAmount.push(item.amount);
        });
        this.transaction = newTransaction(transaction.id, transaction);
    }

    getPriceString(price: number): string {
        return getMoneyString(price);
    }

    toggleEditing() {
        this.editing = !this.editing;
    }

    async deleteTransaction() {
        const delTransaction = newTransaction(this.transaction.id, JSON.parse(JSON.stringify(this.transaction)));
        delTransaction.items.map(item => {
            item.amount = 0;
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

        this.transactionService.editTransaction(this.groupId, transaction, this.itemsAmount)
            .pipe(
                catchError((err) => {
                    loading.dismiss();

                    return EMPTY;
                })
            )
            .subscribe((t) => {
                loading.dismiss();
                this.navController.pop();
                this.events.publish('transactions:update', t);
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
}
