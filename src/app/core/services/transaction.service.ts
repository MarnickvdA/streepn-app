import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Group, Transaction, transactionConverter} from '../models';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {newTransaction, TransactionItem} from '../models/transaction';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '@core/services/auth.service';
import {LoggerService} from '@core/services/logger.service';
import {AnalyticsService} from '@core/services/analytics.service';
import {AngularFirePerformance, trace} from '@angular/fire/performance';

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
    private readonly logger = LoggerService.getLogger(TransactionService.name);

    private curTransactionId: string;
    private transactionSubject: BehaviorSubject<Transaction> = new BehaviorSubject<Transaction>(undefined);
    private transaction$: Observable<Transaction>;
    private transactionSub;
    private destroyerSubject: Subject<void> = new Subject();

    constructor(private authService: AuthService,
                private functions: AngularFireFunctions,
                private performance: AngularFirePerformance,
                private analyticsService: AnalyticsService,
                private fs: AngularFirestore) {
    }

    unsubscribe() {
        this.curTransactionId = undefined;
        this.destroyerSubject.next();
        this.transactionSubject.next(undefined);
    }

    addTransaction(group: Group, transactionSet: TransactionSet): Observable<void> {
        const currentUserAccount = group.getUserAccountByUserId(this.authService.currentUser.uid);
        const transactionItems: TransactionItem[] = [];
        let totalPrice = 0;

        Object.keys(transactionSet).forEach(accountId => {
            Object.keys(transactionSet[accountId]).forEach(productId => {
                const product = group.getProductById(productId);
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

        const transaction = new Transaction(undefined, undefined, currentUserAccount.id, transactionItems, false);

        const callable = this.functions.httpsCallable('addTransaction');
        return callable({
            groupId: group.id,
            transaction
        }).pipe(
            trace('addTransaction'),
            catchError((err) => {
                this.logger.error({message: 'addTransaction', error: err});
                return err;
            }),
            tap(() => {
                this.analyticsService.logTransaction(this.authService.currentUser.uid, group.id);
            })
        );
    }

    editTransaction(groupId: string, updatedTransaction: Transaction): Observable<void> {
        const callable = this.functions.httpsCallable('editTransaction');
        return callable({
            groupId,
            updatedTransaction
        }).pipe(
            trace('editTransaction'),
            catchError((err) => {
                this.logger.error({message: 'editTransaction', error: err});
                return err;
            })
        );
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

    observeTransaction(groupId: string, transactionId: string) {
        if (!this.transaction$ || transactionId !== this.curTransactionId) {
            this.curTransactionId = transactionId;

            this.initTransactionObserver(groupId, transactionId);

            this.transaction$ = this.transactionSubject.asObservable()
                .pipe(
                    takeUntil(this.destroyerSubject)
                );
        }

        return this.transaction$;
    }

    private initTransactionObserver(groupId: string, transactionId: string) {
        if (this.transactionSub) {
            this.transactionSub();
        }

        this.transactionSub = this.fs.collection('groups').doc(groupId).collection('transactions').doc(transactionId)
            .ref
            .withConverter(transactionConverter)
            .onSnapshot((snapshot) => {
                this.transactionSubject.next(snapshot.data());
            });
    }


}
