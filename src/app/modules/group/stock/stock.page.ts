import {Component, OnInit} from '@angular/core';
import {AddStockComponent} from '@modules/group/stock/add-stock/add-stock.component';
import {ModalController} from '@ionic/angular';
import {GroupService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {Group, Product, Stock, stockConverter} from '@core/models';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {RemoveStockComponent} from '@modules/group/stock/remove-stock/remove-stock.component';
import {EditStockComponent} from '@modules/group/stock/edit-stock/edit-stock.component';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faEdit} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-group-stock',
    templateUrl: './stock.page.html',
    styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {
    private LIMIT = 10;

    group: Group;
    private group$: Observable<Group>;
    private groupSub: Subscription;
    private lastSnapshot: QueryDocumentSnapshot<Stock>;
    stockProducts: Product[];
    doneLoading: boolean;
    isLoadingMore: boolean;
    stockTransactions: Stock[];

    constructor(private modalController: ModalController,
                private groupService: GroupService,
                private fs: AngularFirestore,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faEdit);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe(group => {
                this.group = group;

                if (group) {
                    this.stockProducts = group.products.filter(p => !isNaN(p.stock));

                    if (!this.stockTransactions) {
                        this.reset();
                    }
                }
            });
    }

    addStock() {
        this.modalController.create({
            component: AddStockComponent,
            componentProps: {
                group$: this.group$
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

    removeStock() {
        this.modalController.create({
            component: RemoveStockComponent,
            componentProps: {
                group$: this.group$
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
