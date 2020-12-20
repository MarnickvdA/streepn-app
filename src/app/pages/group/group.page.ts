import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Account, Group, Product, Transaction, transactionConverter} from '../../models';
import {IonInfiniteScroll} from '@ionic/angular';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {GroupService} from '../../services/group.service';
import {TransactionService} from '../../services/transaction.service';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

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
                private fs: AngularFirestore) {
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

    reset(event) {
        this.doneLoading = false;
        this.lastSnapshot = undefined;

        this.loadTransactions(this.group.id)
            .then(transactions => {
                this.transactions = transactions;
            })
            .finally(() => {
                event.target.complete();
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
        const ts = [{
            id: '0',
            createdAt: Timestamp.now(),
            amount: 2,
            totalPrice: 100,
            createdBy: 'Marnick',
            createdById: '0DWh5RTZ7pl23c4uTSMNpCAl6dbQ',
            account: {
                userId: '0DWh5RTZ7pl23c4uTSMNpCAl6dbQ',
                name: 'Marnick',
            } as Account, product: {
                name: 'Bier',
                price: 50
            } as Product
        }];

        this.transactionService.addTransaction(this.group.id, ts)
            .subscribe(value => {
                this.transactions = [...value, ...this.transactions];
            });
    }
}
