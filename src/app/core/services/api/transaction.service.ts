import {Injectable} from '@angular/core';
import {House, Transaction, transactionConverter} from '../../models';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';
import {TransactionItem} from '@core/models';
import {AuthService} from '@core/services/firebase/auth.service';
import {AnalyticsService} from '@core/services/firebase/analytics.service';
import {HouseService} from '@core/services';
import {Functions, httpsCallable} from '@angular/fire/functions';
import {doc, Firestore, getDoc, onSnapshot} from '@angular/fire/firestore';
import {Performance, trace} from '@angular/fire/performance';

export interface TransactionSet {
    [accountId: string]: {
        [productId: string]: {
            amount: number;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private curTransactionId: string;
    private transactionSubject: BehaviorSubject<Transaction> = new BehaviorSubject<Transaction>(undefined);
    private transaction$: Observable<Transaction>;
    private transactionSub;
    private destroyerSubject: Subject<void> = new Subject();

    constructor(private authService: AuthService,
                private houseService: HouseService,
                private analyticsService: AnalyticsService,
                private functions: Functions,
                private performance: Performance,
                private firestore: Firestore) {
    }

    unsubscribe() {
        this.curTransactionId = undefined;
        this.destroyerSubject.next();
        this.transactionSubject.next(undefined);
    }

    addTransaction(house: House, transactionSet: TransactionSet): Observable<void> {
        const currentUserAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
        const transactionItems: TransactionItem[] = [];
        let totalPrice = 0;

        Object.keys(transactionSet).forEach(accountId => {
            Object.keys(transactionSet[accountId]).forEach(productId => {
                const product = house.getProductById(productId);
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

        return httpsCallable(this.functions, 'addTransaction').call({
            houseId: house.id,
            transaction
        }).pipe(
            trace(this.performance, 'addTransaction'),
            tap(() => {
                this.analyticsService.logTransaction(this.authService.currentUser.uid, house.id);
            })
        );
    }

    editTransaction(houseId: string, updatedTransaction: Transaction): Observable<void> {
        return httpsCallable(this.functions, 'editTransaction').call({
            houseId,
            updatedTransaction
        }).pipe(
            trace(this.performance, 'editTransaction'),
        );
    }

    getTransaction(houseId: string, transactionId: string): Promise<Transaction> {
        const transactionRef = doc(this.firestore, `houses/${houseId}/transactions/${transactionId}`)
            .withConverter(transactionConverter);

        return getDoc(transactionRef).then((house) => house.data());
    }

    observeTransaction(houseId: string, transactionId: string) {
        if (!this.transaction$ || transactionId !== this.curTransactionId) {
            this.curTransactionId = transactionId;

            this.initTransactionObserver(houseId, transactionId);

            this.transaction$ = this.transactionSubject.asObservable()
                .pipe(
                    takeUntil(this.destroyerSubject)
                );
        }

        return this.transaction$;
    }

    private initTransactionObserver(houseId: string, transactionId: string) {
        if (this.transactionSub) {
            this.transactionSub();
        }

        const transactionRef = doc(this.firestore, `houses/${houseId}/transactions/${transactionId}`)
            .withConverter(transactionConverter);

        this.transactionSub = onSnapshot(transactionRef, (snapshot) => {
            this.transactionSubject.next(snapshot.data());
        });
    }


}
