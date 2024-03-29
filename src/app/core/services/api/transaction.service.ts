import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {House, Transaction, transactionConverter} from '../../models';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {TransactionItem} from '@core/models';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '@core/services/firebase/auth.service';
import {LoggerService} from '@core/services/logger.service';
import {AnalyticsService} from '@core/services/firebase/analytics.service';
import {AngularFirePerformance, trace} from '@angular/fire/performance';
import {HouseService} from '@core/services';

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
    private readonly logger = LoggerService.getLogger(TransactionService.name);

    private curTransactionId: string;
    private transactionSubject: BehaviorSubject<Transaction> = new BehaviorSubject<Transaction>(undefined);
    private transaction$: Observable<Transaction>;
    private transactionSub;
    private destroyerSubject: Subject<void> = new Subject();

    constructor(private authService: AuthService,
                private houseService: HouseService,
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

        const callable = this.functions.httpsCallable('addTransaction');
        return callable({
            houseId: house.id,
            transaction
        }).pipe(
            trace('addTransaction'),
            tap(() => {
                this.analyticsService.logTransaction(house.id);
            })
        );
    }

    editTransaction(houseId: string, updatedTransaction: Transaction): Observable<void> {
        const callable = this.functions.httpsCallable('editTransaction');
        return callable({
            houseId,
            updatedTransaction
        }).pipe(
            trace('editTransaction'),
        );
    }

    getTransaction(houseId: string, transactionId: string): Promise<Transaction> {
        return this.fs.collection('houses').doc(houseId).collection('transactions').doc(transactionId)
            .ref
            .withConverter(transactionConverter)
            .get()
            .then((house) => house.data());
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

        this.transactionSub = this.fs.collection('houses').doc(houseId).collection('transactions').doc(transactionId)
            .ref
            .withConverter(transactionConverter)
            .onSnapshot((snapshot) => {
                this.transactionSubject.next(snapshot.data());
            });
    }


}
