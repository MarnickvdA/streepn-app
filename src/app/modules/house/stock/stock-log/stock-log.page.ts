import {Component, OnDestroy, OnInit} from '@angular/core';
import {House, Stock, stockConverter} from '@core/models';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {EventsService, HouseService} from '@core/services';
import {EditStockComponent} from '@modules/house/stock/stock-log/edit-stock/edit-stock.component';

@Component({
    selector: 'app-stock-log',
    templateUrl: './stock-log.page.html',
    styleUrls: ['./stock-log.page.scss'],
})
export class StockLogPage implements OnInit, OnDestroy {

    house: House;
    doneLoading: boolean;
    isLoadingMore: boolean;
    stockTransactions: Stock[];
    private house$: Observable<House>;
    private houseSub: Subscription;
    private LIMIT = 10;
    private lastSnapshot: QueryDocumentSnapshot<Stock>;
    private readonly refreshSub;

    constructor(private modalController: ModalController,
                private houseService: HouseService,
                private events: EventsService,
                private fs: AngularFirestore) {
        this.refreshSub = () => {
            this.reset();
        };
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe(house => {
                this.house = house;

                if (house) {
                    if (!this.stockTransactions) {
                        this.reset();
                    }
                }
            });

        this.events.subscribe('house:settlement', this.refreshSub);
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.events.unsubscribe('house:settlement', this.refreshSub);
    }

    openStockItem(stockItem: Stock) {
        if (!stockItem.isMutable) {
            return;
        }

        this.modalController.create({
            component: EditStockComponent,
            componentProps: {
                house$: this.house$,
                stockItem,
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();

            modal.onDidDismiss()
                .then((data) => {
                    if (data) {
                        this.reset();
                    }
                });
        });
    }

    reset(event?) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.stockTransactions = [];
        this.loadStockTransactions(this.house.id)
            .finally(() => {
                if (event) {
                    event.target.complete();
                }
            });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadStockTransactions(this.house.id)
            .finally(() => {
                this.isLoadingMore = false;
            });
    }

    loadStockTransactions(houseId: string): Promise<void> {
        if (this.doneLoading) {
            return;
        }

        let ref = this.fs.collection('houses')
            .doc(houseId)
            .collection('stock')
            .ref
            .withConverter(stockConverter)
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
                        this.stockTransactions.push(doc.data());
                    });
                }
            });
    }

}
