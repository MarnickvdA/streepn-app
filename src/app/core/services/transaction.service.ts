import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Transaction, transactionConverter} from '../models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {newTransaction} from '../models/transaction';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private functions: AngularFireFunctions,
                private fs: AngularFirestore) {
    }

    editTransaction(groupId: string, transaction: Transaction, itemsAmount: number[]): Observable<Transaction> {
        let totalPrice = 0;
        const deltaTransaction = newTransaction(transaction.id, transaction);
        deltaTransaction.items = deltaTransaction.items.filter((item, index) => {
            if (item.amount !== itemsAmount[index]) {
                item.amount = -(itemsAmount[index] - item.amount);
                totalPrice += item.amount * item.product.price;
                return true;
            } else {
                return false;
            }
        });

        deltaTransaction.itemCount = deltaTransaction.items.length;

        const updatedTransaction = newTransaction(transaction.id, transaction);
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

        const callable = this.functions.httpsCallable('editTransaction');
        return callable({
            groupId,
            deltaTransaction,
            updatedTransaction
        });
    }

    addTransaction(groupId: string, transaction: Transaction): Observable<Transaction> {
        const callable = this.functions.httpsCallable('addTransaction');
        return callable({
            groupId,
            transaction
        }).pipe(
            map(result => {
                return newTransaction(result.id, result);
            }));
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
