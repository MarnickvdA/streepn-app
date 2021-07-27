import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {House, Transaction, UserAccount} from '@core/models';
import {NavController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {AuthService, HouseService} from '@core/services';

@Component({
    selector: 'app-transaction-item',
    templateUrl: './transaction-item.component.html',
    styleUrls: ['./transaction-item.component.scss'],
})
export class TransactionItemComponent implements OnInit, OnDestroy {
    @Input() transaction: Transaction;

    house?: House;
    account?: UserAccount;
    currentAccount?: UserAccount;

    private houseSub: Subscription;
    private house$: Observable<House>;

    constructor(private navController: NavController,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private authService: AuthService) {
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$
            .subscribe((house) => {
                this.house = house;

                if (house) {
                    this.currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
                    this.account = house.getUserAccountById(this.transaction.createdBy);
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }


    openTransaction(transaction: Transaction) {
        if (transaction.removed) {
            return;
        }
        this.navController.navigateForward([transaction.id], {
            relativeTo: this.route,
            state: {
                house: this.house,
                transaction
            }
        });
    }

}
