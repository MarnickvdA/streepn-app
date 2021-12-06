import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {House, Transaction, transactionConverter, UserAccount} from '@core/models';
import {ModalController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {AuthService, EventsService, HouseService, TransactionService} from '@core/services';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {transactionsPageGuide} from '@shared/components/info-modal/info-guides';
import {toPastelColor} from '@core/utils/string-to-hsl';

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

    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    private houseSub: Subscription;
    private house$: Observable<House>;
    private readonly limit = 15;
    private readonly refreshSub;

    constructor(private route: ActivatedRoute,
                private houseService: HouseService,
                private authService: AuthService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController,
                private events: EventsService,
                private zone: NgZone) {
        this.refreshSub = () => {
            this.zone.run(_ => this.reset());
        };
    }

    ngOnInit(): void {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe((house) => {
                this.zone.run(_ => {
                    this.house = house;

                    if (house) {
                        this.currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);

                        if (!this.transactions) {
                            this.reset();
                        }
                    }
                });
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
        this.zone.run(_ => {
            this.doneLoading = false;
            this.lastSnapshot = undefined;

            this.transactions = [];
            this.loadTransactions(this.house.id)
                .finally(() => {
                    if (event) {
                        event.target.complete();
                    }
                });
        });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadTransactions(this.house.id)
            .finally(() => {
                this.zone.run(_ => {
                    this.isLoadingMore = false;
                });
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
            .limit(this.limit);

        if (this.lastSnapshot) {
            ref = ref.startAfter(this.lastSnapshot);
        }

        if (this.house.settledAt) {
            ref = ref.endBefore(this.house.settledAt);
        }

        return ref.get()
            .then((result) => {
                this.zone.run(_ => {
                    if (result.docs.length < this.limit) {
                        this.doneLoading = true;
                    }

                    if (result.docs.length > 0) {
                        this.lastSnapshot = result.docs[result.docs.length - 1];

                        result.docs.forEach((doc) => {
                            this.transactions.push(doc.data());
                        });
                    }
                });
            });
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'house.transactions.title',
            transactionsPageGuide
        ).catch(err => console.error(err));
    }

    accountIdToColor(id: string) {
        return toPastelColor(id);
    }
}
