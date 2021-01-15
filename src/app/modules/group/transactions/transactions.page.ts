import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@core/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {Balance, Group, Transaction, transactionConverter, UserAccount} from '@core/models';
import {ModalController, NavController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {getMoneyString} from '@core/utils/firestore-utils';
import {AuthService, EventsService, GroupService, TransactionService} from '@core/services';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faMinusCircle} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.page.html',
    styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit, OnDestroy {
    group?: Group;
    currentAccount?: UserAccount;
    balance?: Balance;
    transactions: Transaction[];
    doneLoading = false;
    isLoadingMore = false;
    private LIMIT = 15;
    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    private groupSub: Subscription;
    private group$: Observable<Group>;
    private readonly refreshSub;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private groupService: GroupService,
                private authService: AuthService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController,
                private events: EventsService,
                private navController: NavController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faMinusCircle);
        this.refreshSub = () => {
            this.reset();
        };
    }

    ngOnInit(): void {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe((group) => {
                this.group = group;

                if (group) {
                    this.currentAccount = group.accounts.find(acc => acc.userId === this.authService.currentUser.uid);
                    this.balance = group.getAccountBalance(this.currentAccount.id);

                    if (!this.transactions) {
                        this.reset();
                    }
                }
            });

        this.events.subscribe('transactions:update', this.refreshSub);
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
        this.events.unsubscribe('transactions:update', this.refreshSub);
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
        this.navController.navigateForward([transaction.id], {
            relativeTo: this.route,
            state: {
                group: this.group,
                transaction
            }
        });
    }
}
