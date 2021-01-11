import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Account, Group, Product, Transaction, transactionConverter, UserAccount} from '../models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {newTransaction, TransactionItem} from '../models/transaction';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '@core/services/auth.service';

export interface TransactionSet {
    [accountId: string]: {
        [productId: string]: {
            amount: number;
        }
    };
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private authService: AuthService,
                private functions: AngularFireFunctions,
                private fs: AngularFirestore) {
    }

    addTransaction(group: Group, transactionSet: TransactionSet): Observable<Transaction> {
        const productDictionary: { [productId: string]: Product } = {};
        group.products.forEach(p => {
            productDictionary[p.id] = p;
        });

        const accountDictionary: { [accountId: string]: Account } = {};
        group.accounts.forEach(a => {
            accountDictionary[a.id] = a;
        });
        group.sharedAccounts.forEach(a => {
            accountDictionary[a.id] = a;
        });

        const currentUserAccount = group.accounts.find(acc => acc.userId === this.authService.currentUser.uid) as UserAccount;
        const transactionItems: TransactionItem[] = [];
        let totalPrice = 0;

        Object.keys(transactionSet).forEach(accountId => {
            Object.keys(transactionSet[accountId]).forEach(productId => {
                const product = productDictionary[productId];
                const amount = transactionSet[accountId][productId].amount;

                if (amount > 0) {
                    totalPrice += product.price * amount;
                    transactionItems.push({
                        amount,
                        accountId,
                        productId,
                        productPrice: product.price
                    } as TransactionItem);
                }
            });
        });

        const transaction = new Transaction(undefined, undefined, currentUserAccount.id,
            totalPrice, transactionItems.length, transactionItems, false);

        console.log(transaction);

        const callable = this.functions.httpsCallable('addTransaction');
        return callable({
            groupId: group.id,
            transaction
        }).pipe(
            map(result => {
                return newTransaction(result.id, result);
            }));
    }

    editTransaction(groupId: string, transaction: Transaction, itemsAmount: number[]): Observable<Transaction> {
        let totalPrice = 0;
        const deltaTransaction = newTransaction(transaction.id, transaction);
        deltaTransaction.items = deltaTransaction.items.filter((item, index) => {
            if (item.amount !== itemsAmount[index]) {
                item.amount = -(itemsAmount[index] - item.amount);
                totalPrice += item.amount * item.productPrice;
                return true;
            } else {
                return false;
            }
        });

        deltaTransaction.totalPrice = -transaction.totalPrice - totalPrice;
        deltaTransaction.itemCount = deltaTransaction.items.length;

        const updatedTransaction = newTransaction(transaction.id, transaction);
        updatedTransaction.totalPrice = 0;
        updatedTransaction.items = updatedTransaction.items.filter((item, index) => {
            if (item.amount > 0) {
                updatedTransaction.totalPrice += item.amount * item.productPrice;
                return true;
            } else {
                return false;
            }
        });

        updatedTransaction.itemCount = updatedTransaction.items.length;

        const callable = this.functions.httpsCallable('editTransaction');
        return callable({
            groupId,
            deltaTransaction,
            updatedTransaction
        });
    }

    getTransaction(groupId: string, transactionId: string): Promise<Transaction> {
        return this.fs.collection('groups').doc(groupId).collection('transactions').doc(transactionId)
            .ref
            .withConverter(transactionConverter)
            .get()
            .then((group) => {
                return group.data();
            });
    }
}
