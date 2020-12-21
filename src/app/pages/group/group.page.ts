import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Group, Transaction, transactionConverter} from '../../models';
import {IonInfiniteScroll, ModalController} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {GroupService} from '../../services/group.service';
import {TransactionService} from '../../services/transaction.service';
import {AddTransactionComponent} from './add-transaction/add-transaction.component';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {
    private LIMIT = 20;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    group?: Group;
    transactions: Transaction[];

    private lastSnapshot: QueryDocumentSnapshot<Transaction>;
    doneLoading = false;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private groupService: GroupService,
                private transactionService: TransactionService,
                private fs: AngularFirestore,
                private modalController: ModalController) {
        this.route.params.subscribe((params: Params) => {
            groupService.getGroup(params.id)
                .then(group => {
                    this.group = group;
                });

            if (!this.transactions) {
                this.loadTransactions(params.id)
                    .then(transactions => {
                        this.transactions = transactions;
                    });
            }
        });
    }

    ngOnInit(): void {
    }

    reset(event?) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.loadTransactions(this.group.id)
            .then(transactions => {
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
                this.transactions.push(...transactions);
            });
    }

    loadTransactions(groupId: string): Promise<Transaction[]> {
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
