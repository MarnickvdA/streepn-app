import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Group, Transaction, transactionConverter} from '../../models';
import {IonInfiniteScroll, ModalController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {GroupService} from '../../services/group.service';
import {TransactionService} from '../../services/transaction.service';
import {AddTransactionComponent} from './add-transaction/add-transaction.component';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit, OnDestroy {
    private LIMIT = 20;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    private groupId: string;
    group?: Group;
    transactions: Transaction[];

    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    private routeSub: Subscription;
    doneLoading = false;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private groupService: GroupService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController) {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
        });
    }

    ngOnInit(): void {
        this.groupService.getGroup(this.groupId)
            .then(group => {
                this.group = group;

                if (!this.transactions) {
                    this.loadTransactions(this.group.id)
                        .then(transactions => {
                            this.transactions = transactions;
                        });
                }
            });
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
    }

    reset(event?) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.loadTransactions(this.group.id)
            .then(transactions => {
                // console.log('reset()');
                // console.log('Loaded:');
                // console.log(transactions);
                // console.log('Replacing it for transactions:');
                // console.log(this.transactions);
                this.transactions = transactions;
            })
            .finally(() => {
                if (event) {
                    event.target.complete();
                }
            });
    }

    loadNext() {
        this.loadTransactions(this.group.id)
            .then((transactions) => {
                // console.log('loadNext()');
                // console.log('Loaded:');
                // console.log(transactions);
                // console.log('Adding it to all transactions:');
                // console.log(this.transactions);
                this.transactions.push(...transactions);
            });
    }

    loadTransactions(groupId: string): Promise<Transaction[]> {
        // console.log('Loading transactions with transactions list of size: ' + this.transactions?.length);
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

                const transactions: Transaction[] = [];

                if (result.docs.length > 0) {
                    this.lastSnapshot = result.docs[result.docs.length - 1];

                    result.docs.forEach((doc) => {
                        transactions.push(doc.data());
                    });
                }

                return transactions;
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
                    this.reset();
                });
        });
    }
}
