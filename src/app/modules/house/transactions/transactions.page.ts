import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {House, Transaction, transactionConverter, UserAccount} from '@core/models';
import {ModalController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {AuthService, EventsService, HouseService, TransactionService} from '@core/services';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.page.html',
    styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit, OnDestroy {
    house?: House;
    currentAccount?: UserAccount;
    transactions: Transaction[];
    doneLoading = false;
    isLoadingMore = false;
    private LIMIT = 15;
    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    private houseSub: Subscription;
    private house$: Observable<House>;
    private readonly refreshSub;

    constructor(private route: ActivatedRoute,
                private houseService: HouseService,
                private authService: AuthService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController,
                private events: EventsService) {
        this.refreshSub = () => {
            this.reset();
        };
    }

    ngOnInit(): void {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe((house) => {
                this.house = house;

                if (house) {
                    this.currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);

                    if (!this.transactions) {
                        this.reset();
                    }
                }
            });

        this.events.subscribe('transactions:update', this.refreshSub);
        this.events.subscribe('house:settlement', this.refreshSub);
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
        this.events.unsubscribe('transactions:update', this.refreshSub);
        this.events.unsubscribe('house:settlement', this.refreshSub);
    }

    reset(event?) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.transactions = [];
        this.loadTransactions(this.house.id)
            .finally(() => {
                if (event) {
                    event.target.complete();
                }
            });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadTransactions(this.house.id)
            .finally(() => {
                this.isLoadingMore = false;
            });
    }

    loadTransactions(houseId: string): Promise<void> {
        if (this.doneLoading) {
            return;
        }

        let ref = this.fs.collection('houses')
            .doc(houseId)
            .collection('transactions')
            .ref
            .withConverter(transactionConverter)
            .orderBy('createdAt', 'desc')
            .limit(this.LIMIT);

        if (this.lastSnapshot) {
            ref = ref.startAfter(this.lastSnapshot);
        }

        if (this.house.settledAt) {
            ref = ref.endBefore(this.house.settledAt);
        }

        return ref.get()
            .then((result) => {
                if (result.docs.length < this.LIMIT) {
                    this.doneLoading = true;
                }

                if (result.docs.length > 0) {
                    this.lastSnapshot = result.docs[result.docs.length - 1];

                    result.docs.forEach((doc) => {
                        this.transactions.push(doc.data());
                    });
                }
            });
    }
}