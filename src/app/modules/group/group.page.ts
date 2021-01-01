import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../core/services/user.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Group, Transaction, transactionConverter} from '../../core/models';
import {ModalController, NavController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {GroupService} from '../../core/services/group.service';
import {TransactionService} from '../../core/services/transaction.service';
import {AddTransactionComponent} from './add-transaction/add-transaction.component';
import {Subscription} from 'rxjs';
import {EventsService} from '../../core/services/events.service';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit, OnDestroy {
    group?: Group;
    transactions: Transaction[];
    doneLoading = false;
    isLoadingMore = false;
    private LIMIT = 15;
    private groupId: string;
    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    private routeSub: Subscription;
    private groupSub: Subscription;
    private readonly refreshSub;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private groupService: GroupService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController,
                private events: EventsService,
                private router: Router,
                private navController: NavController) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
        });

        this.refreshSub = () => {
            this.reset();
        };
    }

    ngOnInit(): void {
        this.groupSub = this.groupService.observeGroup(this.groupId)
            .subscribe((group) => {
                this.group = group;

                if (!this.transactions) {
                    this.reset();
                }
            });

        this.events.subscribe('transaction:edit', this.refreshSub);
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
        this.groupSub.unsubscribe();
        this.events.unsubscribe('transaction:edit', this.refreshSub);
    }

    reset(event?) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.transactions = [];
        this.loadTransactions(this.group.id)
            .finally(() => {
                if (event) {
                    event.target.complete();
                }
            });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadTransactions(this.group.id)
            .finally(() => {
                this.isLoadingMore = false;
            });
    }

    loadTransactions(groupId: string): Promise<void> {
        if (this.doneLoading) {
            return;
        }

        let ref = this.fs.collection('groups')
            .doc(groupId)
            .collection('transactions')
            .ref
            .withConverter(transactionConverter)
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
                        this.transactions.push(doc.data());
                    });
                }
            });
    }

    openTransaction(transaction: Transaction) {
        if (transaction.removed) {
            return;
        }
        const relativeRoute = this.router.createUrlTree(['transactions', transaction.id], {
            relativeTo: this.route
        });

        this.navController.navigateForward(relativeRoute, {
            state: {
                group: this.group,
                transaction
            }
        });
    }

    addTransaction() {
        this.modalController.create({
            component: AddTransactionComponent,
            componentProps: {
                group: this.group
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
            modal.onWillDismiss()
                .then((callback) => {
                    if (callback.data) {
                        this.reset();
                    }
                });
        });
    }
}
