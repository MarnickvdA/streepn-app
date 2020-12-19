import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {Group, Transaction, transactionConverter} from '../../models';
import {IonInfiniteScroll} from '@ionic/angular';
import {FirestoreService} from '../../services/firestore.service';
import {BehaviorSubject} from 'rxjs';
import {CollectionReference, Query, QueryDocumentSnapshot} from '@angular/fire/firestore';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    group: Group;
    transactions$: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);

    private transactionsRef: CollectionReference<Transaction>;
    private lastVisible?: QueryDocumentSnapshot<Transaction>;
    private nextQueryRef: Query<Transaction>;
    private done = false;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private firestoreService: FirestoreService) {
        this.route.params.subscribe(params => {
            this.group = this.userService.groups.find(group => group.id === params.id);

            this.transactionsRef = this.firestoreService.groupsCollection
                .doc(this.group.id)
                .collection('transactions')
                .ref
                .withConverter(transactionConverter);

            this.nextQueryRef = this.transactionsRef;
        });
    }

    ngOnInit() {
        this.getTransactions();
    }

    loadData(event) {
        if (!this.done) {
            this.getTransactions();
        } else {
            event.target.disabled = true;
        }
    }

    private getTransactions() {
        this.nextQueryRef
            .orderBy('createdAt')
            .limit(10)
            .get()
            .then((snapshot) => {
                if (snapshot.docs.length < 10) {
                    this.done = true;
                }

                this.lastVisible = snapshot.docs[snapshot.docs.length - 1];

                this.transactions$.next(snapshot.docs.map((doc) => doc.data()));

                this.nextQueryRef = this.transactionsRef
                    .orderBy('createdAt', 'desc')
                    .startAfter(this.lastVisible)
                    .limit(10);
            });
    }
}
