import {Component, OnDestroy, OnInit} from '@angular/core';
import {Group, Stock, stockConverter} from '@core/models';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {GroupService} from '@core/services';
import {EditStockComponent} from '@modules/group/stock/stock-log/edit-stock/edit-stock.component';

@Component({
    selector: 'app-stock-log',
    templateUrl: './stock-log.page.html',
    styleUrls: ['./stock-log.page.scss'],
})
export class StockLogPage implements OnInit, OnDestroy {

    group: Group;
    private group$: Observable<Group>;
    private groupSub: Subscription;
    doneLoading: boolean;
    isLoadingMore: boolean;
    stockTransactions: Stock[];
    private LIMIT = 10;
    private lastSnapshot: QueryDocumentSnapshot<Stock>;


    constructor(private modalController: ModalController,
                private groupService: GroupService,
                private fs: AngularFirestore) {
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe(group => {
                this.group = group;

                if (group) {
                    if (!this.stockTransactions) {
                        this.reset();
                    }
                }
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    openStockItem(stockItem: Stock) {
        if (!stockItem.isMutable) {
            return;
        }

        this.modalController.create({
            component: EditStockComponent,
            componentProps: {
                group$: this.group$,
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
        this.loadStockTransactions(this.group.id)
            .finally(() => {
                if (event) {
                    event.target.complete();
                }
            });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadStockTransactions(this.group.id)
            .finally(() => {
                this.isLoadingMore = false;
            });
    }

    loadStockTransactions(groupId: string): Promise<void> {
        if (this.doneLoading) {
            return;
        }

        let ref = this.fs.collection('groups')
            .doc(groupId)
            .collection('stock')
            .ref
            .withConverter(stockConverter)
            .orderBy('createdAt', 'desc')
            .limit(this.LIMIT);

        if (this.lastSnapshot) {
            ref = ref.startAfter(this.lastSnapshot);
        }

        if (this.group.settledAt) {
            ref = ref.endBefore(this.group.settledAt);
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
