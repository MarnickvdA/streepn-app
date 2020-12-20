import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Transaction} from '../models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {newTransaction} from '../models/transaction';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private functions: AngularFireFunctions) {
    }

    addTransaction(groupId: string, transactions: Transaction[]): Observable<Transaction[]> {
        const callable = this.functions.httpsCallable('addTransaction');
        return callable({
            groupId,
            transactions
        }).pipe(
            map(result => result.map(value => {
                // There were some issues with getting the date nicely from the function, so we did a little ugly conversion.
                value.createdAt = Timestamp.fromMillis(value.createdAt);

                return newTransaction(value.id, value);
            }))
        );
    }
}
