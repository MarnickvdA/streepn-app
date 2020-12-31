import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Transaction} from '../models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {newTransaction} from '../models/transaction';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private functions: AngularFireFunctions) {
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
}
