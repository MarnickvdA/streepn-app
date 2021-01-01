import {Component, OnInit} from '@angular/core';
import {EMPTY, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, Transaction} from '../../../core/models';
import {TransactionService} from '../../../core/services/transaction.service';
import {newTransaction, TransactionItem} from '../../../core/models/transaction';
import {getMoneyString} from '../../../core/utils/firestore-utils';
import {LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {catchError} from 'rxjs/operators';
import {newGroup} from '../../../core/models/group';
import {EventsService} from '../../../core/services/events.service';

@Component({
    selector: 'app-transaction-detail',
    templateUrl: './transaction-detail.page.html',
    styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit {

    private routeSub: Subscription;
    editing: boolean;
    groupId: string;
    transactionId: string;
    group: Group;
    transaction: Transaction;
    itemsAmount: number[] = [];
    interactionCount = 0;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private navController: NavController,
                private events: EventsService) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
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
        this.transaction = transaction;
    }

    getPriceString(price: number): string {
        return getMoneyString(price);
    }

    toggleEditing() {
        this.editing = !this.editing;
    }

    async deleteTransaction() {
        this.transaction.items.map(item => {
            item.amount = 0;
            return item;
        });

        this.interactionCount = 1;

        await this.editTransaction();
    }

    async editTransaction() {
        if (this.interactionCount === 0) {
            return this.toggleEditing();
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();


        const updatedTransaction = newTransaction(this.transaction.id, this.transaction);
        updatedTransaction.totalPrice = 0;
        updatedTransaction.items = updatedTransaction.items.filter((item, index) => {
            if (item.amount > 0) {
                updatedTransaction.totalPrice += item.amount * item.product.price;
                return true;
            } else {
                return false;
            }
        });

        updatedTransaction.itemCount = updatedTransaction.items.length;

        let totalPrice = 0;
        const paybackTransaction = newTransaction(this.transaction.id, this.transaction);
        paybackTransaction.items = paybackTransaction.items.filter((item, index) => {
            if (item.amount !== this.itemsAmount[index]) {
                item.amount = -(this.itemsAmount[index] - item.amount);
                totalPrice += item.amount * item.product.price;
                return true;
            } else {
                return false;
            }
        });

        paybackTransaction.itemCount = paybackTransaction.items.length;
        this.transactionService.editTransaction(this.groupId, paybackTransaction, updatedTransaction)
            .pipe(
                catchError((err) => {
                    loading.dismiss();

                    return EMPTY;
                })
            )
            .subscribe((transaction) => {
                loading.dismiss();
                this.navController.pop();
                this.events.publish('transaction:edit', transaction);
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