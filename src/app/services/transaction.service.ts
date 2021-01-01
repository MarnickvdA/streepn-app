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

    editTransaction(groupId: string, paymentTransaction: Transaction, updatedTransaction: Transaction): Observable<Transaction> {
        const callable = this.functions.httpsCallable('editTransaction');
        return callable({
            groupId,
            paymentTransaction,
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
